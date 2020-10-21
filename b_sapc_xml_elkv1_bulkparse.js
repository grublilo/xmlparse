'use strict'
const zlib = require('zlib')
const fs = require('fs')
const path = require('path')
const test_xmlgz_dir=  './test-xmldata'
const pdu_xmlgz_dir=  './xmldata/sapc_xml'
const parseXML=require('./lib/parse-sapc-xml-elk_v1.js')


function walkfiles(dir) {
    let results = []
    const list = fs.readdirSync(dir)
    list.forEach(function(file) {
        if (file === 'static') {
            return false
        }
        file = dir + '/' + file
        const stat = fs.statSync(file)
        if (stat.isFile() && path.extname(file) === '.gz') {
            results.push(path.resolve(__dirname, file))
        }

    })
    return results
}



function dealfiles(files) {
    files.forEach(sfile => {
        const dfile=sfile.replace(/\.gz$/g,"")

        fs.mkdir(path.join(path.dirname(sfile),'processed'), { recursive: true }, (err) => {
            if (err) throw err;
        })

        const processed_file=path.join(path.dirname(sfile),'processed',path.basename(sfile))
        console.log(`${path.basename(sfile)} ungziping.... to  ${path.basename(dfile)} temporarily`)

        let ws=fs.createWriteStream(dfile)
        fs.createReadStream(sfile).pipe(zlib.createGunzip()).pipe(ws)

        ws.on('finish',()=>{

            fs.rename(sfile, processed_file, (err)=> {
                if (err){throw err}
                fs.stat(processed_file,  (err, stats)=> {
                    if (err) {throw err}
                    console.log(`${path.basename(processed_file)} be parsing done`)
                })
            })


            const parsed_file=sfile.replace(/xml\.gz/g,'parsed_elkv1')
            const sapcxml=parseXML(fs.readFileSync(dfile),sfile)
            //console.log(parsed_file)
            //console.log(JSON.stringify(sapcxml))

            fs.writeFile(parsed_file, JSON.stringify(sapcxml), { 'flag': 'w' }, function(err) {
                if (err) {
                    throw err;
                }
                console.log(`Saved in ${parsed_file}`);
                fs.unlinkSync(dfile)
            })



        })




    })
}


const files=walkfiles(pdu_xmlgz_dir)

//console.log(files)
dealfiles(files)

