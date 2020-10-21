'use strict'
const cheerio=require('cheerio')
const zlib = require('zlib')
const fs = require('fs')
const path = require('path')
const test_xmlgz_dir=  './test-xmldata'
const pdu_xmlgz_dir=  './xmldata/sapc_xml'
const parseXML=require('./lib/parse-sapc-xml-elk_v1.js')


const ma2j=(array1,array2,tempobj)=>{
    if(array1.lenghth===array2.lenghth){
        array1.map((item1,index)=> {
            tempobj[item1] = array2[`${index}`]
        })
    }
    return tempobj
}





const sfile='./xmldata/sapc_xml/A20200213.2245+0800-2300+0800_GLSAPC2.xml.gz',
    filename=path.basename(sfile),
    filetag=filename.replace(/^A|\.\d{4}|\-|\+\d{4}|\.xml\.gz$/g,"")

const dfile=sfile.replace(/\.gz$/g,"")

console.log(sfile,dfile)


fs.mkdir(path.join(path.dirname(sfile),'processed'), { recursive: true }, (err) => {
    if (err) throw err;
})

const processed_file=path.join(path.dirname(sfile),'processed',path.basename(sfile))
console.log(`${path.basename(sfile)} ungziping.... to  ${path.basename(dfile)} temporarily`)

let ws=fs.createWriteStream(dfile)
fs.createReadStream(sfile).pipe(zlib.createGunzip()).pipe(ws)



ws.on('finish',()=>{
    /**
     fs.rename(sfile, processed_file, (err)=> {
        if (err){throw err}
        fs.stat(processed_file,  (err, stats)=> {
            if (err) {throw err}
            console.log(`${path.basename(processed_file)} be parsing done`)
        })
    })
     **/
    const parsed_file=sfile.replace(/xml\.gz/g,'parsed_elkv1')
    const sapcxml=parseXML(fs.readFileSync(dfile),sfile)
    fs.writeFile(parsed_file, JSON.stringify(sapcxml), { 'flag': 'w' }, function(err) {
        if (err) {
            throw err;
        }
        console.log(`Saved in ${parsed_file}`);

        fs.unlinkSync(dfile)
    })



})






