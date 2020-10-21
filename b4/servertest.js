'use strict'
const express=require('express')
const morgan=require('morgan')
const nconf=require('nconf')
const request=require('request')
const pkg=require('./package.json')

//nconf.argv().env('__')
//  .file({file: `${__dirname}/config.json` })

nconf.argv().env('__')
    .defaults({conf: `${__dirname}/config.json` })
    .file(nconf.get('conf'))



const app=express()

app.use(morgan('dev'))

const es=nconf.get('es')
const url=`http://${es.host}:${es.port}/books/book/_search`
console.log(nconf.get('port'))

console.log(url)

app.get('/api/version',(req,res)=>{
    res.status(200).send(pkg.version)

})


app.get('/api/search/books/:field/:query',(req,res)=> {

    const esReqBody = {

        size: 10,
        query: {
            match: {
                [req.params.field]: req.params.query
            }
        }

    }


    const options = {url, json: true, body: esReqBody}

    //console.log(options)
    request.get(options, (err, esRes, esReqBody) => {
        if (err) {
            res.status(502).json({
                error: 'bad_gateway',
                reason: err.code
            })

            return
        }

        if (esRes.statusCode !== 200) {
            res.status(esRes.statusCode).json(esReqBody)
            return
        }
        res.status(200).json(esReqBody.hits.hits.map(({_source})=>_source))

        //res.status(200).json(esReqBody)


    })

})
app.listen(nconf.get('port'),()=>console.log('Ready.'))

