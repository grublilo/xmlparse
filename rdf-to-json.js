


const fs=require('fs')
const expect=require('chai').expect
const parseRDF=require('./lib/parse-rdf.js')
const rdf=fs.readFileSync(`${__dirname}/test/pg132.rdf`)

const book = parseRDF(rdf)
console.log(JSON.stringify(book,null,''))