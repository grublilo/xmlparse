#!/usr/bin/node

'use strict'
const fs=require('fs'),
    request=require('request'),
    program=require('commander'),
    pkg=require('./package.json')


const fullUrl=(path ='')=>{
    let url=`http://${program.host}:${program.port}/`;
    if(program.index){
        url+=program.index+'/';
        if(program.type){
            url+=program.type+'/';
        }
    }
    return url+path.replace(/^\/*/,'')

}

const handleResponse=(err,res,body)=>{
    if(program.json){
        console.log(JSON.stringify( err || body))
    }else{
        if(err)throw err;
        console.log(body)

    }}

program.version(pkg.version)
       .description(pkg.description)
       .usage('[...]')
       .option('-o,--host <hostname>','hostname [Localhost]','Localhost')
       .option('-p,--port <number>','port number [9200]','9200')
       .option('-j,--json ','format output as JSON')
       .option('-i,--index <name>','which index to use')
       .option('-f,--filter <filter>','source filter for query results')
       .option('-t,--type <type>','default type for bulk operations');


program.command('url [path]')
    .description('generate the URL for the options and path (default is /)')
    .action((path='/')=>{
        console.log(fullUrl(path))
    })

program.command('get [path]')
    .description('get the URL  response for the options and path (default is /)')
    .action((path='/')=>{
        //console.log(fullUrl(path))
        const options={
            url: fullUrl(path),
            json: program.json
        }
        request(options,handleResponse)
        })


program.command('create-index')
    .description('create an index')
    .action(()=>{
        if(!program.index){
            const msg='No index specified! use --index <name>'
            if(!program.json){throw Error(msg)}
            console.log(JSON.stringify({err:msg}))
            return
        }
        const options={
            url: fullUrl(),
            json: program.json
        }
        console.log(fullUrl())
        request.put(options, handleResponse)
    })

program.command('delete-index')
    .description('delete an index')
    .alias('di')
    .action(()=>{
        if(!program.index){
            const msg='No index specified! use --index <name>'
            if(!program.json){throw Error(msg)}
            console.log(JSON.stringify({err:msg}))
            return
        }
        const options={
            url: fullUrl(),
            json: program.json
        }
        console.log(fullUrl())
        request.delete(options, handleResponse)
    })



program.command('list-index')
    .alias('li')
    .description('get a list of indices in this cluster')
    .action(()=>{
        const path =program.json ? '_all':'_cat/indices?v'
        const options={
            url: fullUrl(path),
            json: program.json
        }
        request(options, handleResponse)
    })

program.command('bulk <file>')
    .description('read and perform bulk options from the specified file')
    .action(file=>{
     fs.stat(file,(err,stats)=>{
         if(err){
             if(program.json){
                 console.log(JSON.stringify(err))
                 return
             }
             throw err
         }
         const options={
             url: fullUrl('_bulk'),
             json:true,
             headers:{
                 'content-length': stats.size,
                 'content-type': 'application/json',
             }
         }
         const req = request.post(options)
         const stream=fs.createReadStream(file)
         stream.pipe(req)
         req.pipe(process.stdout)
     })
    })


program.command('query [queries...]')
    .alias('q')
    .description('perform an elasticsearch query')
    .action((queries=[])=>{
        const options={
            url: fullUrl('_search'),
            json: program.json,
            qs: {}
        }
        if(queries && queries.length){
            options.qs.q=queries.join('')
        }

        if(program.filter){
            options.qs._source=program.filter
        }
        request(options, handleResponse)
    })




program.parse(process.argv);


//console.log(program)
if(program.args.filter(arg=>(typeof arg)==='object').length) {
    program.help()
}