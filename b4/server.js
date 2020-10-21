'use strict'
const express=require('express')
const morgan=require('morgan')
const nconf=require('nconf')

const pkg=require('./package.json')

//nconf.argv().env('__')
  //  .file({file: `${__dirname}/config.json` })

nconf.argv().env('__')
    .defaults({conf: `${__dirname}/config.json` })
    .file(nconf.get('conf'))
    //.file({file: `${__dirname}/config.json` })


console.log(nconf.get('port'))
console.log(nconf.get('es:host'))
console.log(nconf.get('conf'))

const app=express()

app.use(morgan('dev'))

app.get('/api/version',(req,res)=>{
    res.status(200).send(pkg.version)

})

require('./lib/search.js')(app,nconf.get('es'))
require('./lib/bundle.js')(app,nconf.get('es'))


app.listen(nconf.get('port'),()=>console.log('Ready.'))
