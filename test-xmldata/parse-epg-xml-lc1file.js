'use strict'
const cheerio=require('cheerio')

const zlib = require('zlib')
const fs = require('fs')
const path = require('path')
const test_xmlgz_dir=  './test-xmldata'
const pdu_xmlgz_dir=  './xmldata/epg_xml'
//const parseXML=require('./lib/parse-epg-xml.js')


const ma2j=(array1,array2,tempobj)=>{
    if(array1.lenghth===array2.lenghth){
        array1.map((item1,index)=> {
            tempobj[item1] = array2[`${index}`]
        })
    }
    return tempobj

}

const parseldnvalue=(str,object)=>{
    const reg = /\[(.+?)=(.+?)\]/;
    const reg_g = /\[(.+?)=(.+?)\]/g
    const result = str.match(reg_g)
    for (let i = 0; i < result.length; i++) {
        const item = result[i]
        object[item.match(reg)[1]]=item.match(reg)[2]
    }
    return object
}



const sfile='../test-xmldata/A20200814.1330+0800-1345+0800_GLPGW1.xml.gz',
filename=path.basename(sfile),
filetag=filename.replace(/^A|\.\d{4}|\-|\+\d{4}|\.xml\.gz$/g,"")





const dfile=sfile.replace(/\.gz$/g,"")

//console.log(sfile,dfile)


fs.mkdir(path.join(path.dirname(sfile),'processed'), { recursive: true }, (err) => {
        if (err) throw err;
    })

const processed_file=path.join(path.dirname(sfile),'processed',path.basename(sfile))
//console.log(`${path.basename(sfile)} ungziping.... to  ${path.basename(dfile)} temporarily`)




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

    const xml=fs.readFileSync(dfile)

    //console.log(xml)
    const $=cheerio.load(xml)
    const xml_info={}

    let jobids=$('job').toArray().map(elem=>$(elem).attr('jobid'))
    jobids=[...new Set(jobids)]
    xml_info.jobids=jobids
    //console.log(jobids)
    xml_info.node=$('managedElement','measData').attr('localdn')
    xml_info.begintime=$('measCollec','fileHeader').attr('begintime')
    jobids.forEach((jobid)=>{
        //console.log(jobid)
        xml_info[`measInfoIds_${jobid}`] = $(`[jobId=${jobid}]`)
            .parent().toArray().map(elem => $(elem).attr('measinfoid'))

        const measInfos = $(`[jobId=${jobid}]`).parent().toArray()


        // loop level 1
        measInfos.forEach((meansinfo,index1)=> {

            const $ = cheerio.load(meansinfo),
            time = $('granPeriod').attr('endtime'),
            duration = $('granPeriod').attr('duration'),
            measinfoid = $('measInfo').attr('measinfoid'),

            meansinfo_json={},
            ldnvalues=$('measValue').toArray().map(elem=> $(elem).attr('measobjldn')),
            measTypes=$('measType').toArray().map(elem => $(elem).text())

            meansinfo_json.time=time
            meansinfo_json.duration=duration
            meansinfo_json.filename=filename

            meansinfo_json.index={"_id":`${measinfoid}`}
            //console.log(index1,measinfoid)


            if(ldnvalues.length>1){
                if(measinfoid==="board-information"){
                    const eachMeasValues=[]
                    ldnvalues.forEach((ldnvalue,index2)=>{
                        //console.log(index1,index2,ldnvalue)
                        const values=$(`[measObjLdn="${ldnvalue}"]`).find('r').toArray().map(elem=>+$(elem).text())
                        const ldnobj=parseldnvalue(ldnvalue, {})
                        const ldnobjid= Object.values(ldnobj).join('_').replace(/\/|-/g,'')
                        //meansinfo_json.id=`${measinfoid.replace(/-/g,'')}_${ldnobjid}_${filetag}`
                        const ldnplusobjj=ma2j(Object.keys(ldnobj), Object.values(ldnobj),{})

                        //if (measTypes.length===values.length) {
                        const parseobj = ma2j(measTypes, values,ldnplusobjj)

                        console.log(parseobj)
                        //console.log(index1,index2,parseobj)
                        parseobj.id=`${measinfoid.replace(/-/g,'')}_${ldnobjid}_${filetag}`
                        eachMeasValues.push(parseobj)

                        //meansinfo_json[`${measinfoid.replace(/-/g,'')}_${ldnobjid}_${filetag}`]=parseobj
                        //xml_info[`${measinfoid}_${jobid}`] = meansinfo_json




                   })
                    xml_info[`${measinfoid}_${jobid}`] = eachMeasValues
                    //console.log(ldnsinfo)

                    //console.log(eachMeasValues)

               }

            }else {
                if (measinfoid === "ggsn-global-stats") {
                        //console.log(measinfoid)
                        //meansinfo_json.id=`${measinfoid.replace(/-/g,'')}_${filetag}`
                        const values = $('r').toArray().map(elem => +$(elem).text())
                    //structure json object  between measTypes and values bu function ma2j
                    if (measTypes.length===values.length){
                        const parseobj=ma2j(measTypes, values,{})
                    //console.log(parseobj)
                        meansinfo_json[`${measinfoid.replace(/-/g,'')}_${filetag}`] = parseobj
                        xml_info[`${measinfoid}_${jobid}`] = meansinfo_json
                }

            }
    }

})


})
    //return xml_info
    console.log(xml_info)

    const parsed_file=sfile.replace(/xml\.gz/g,'parsed_lc1ftemp')
    fs.writeFile(parsed_file, JSON.stringify(xml_info), { 'flag': 'w' }, function(err) {
        if (err) {
            throw err;
        }
        console.log(`Saved in ${parsed_file}`);

        fs.unlinkSync(dfile)
    })


})


