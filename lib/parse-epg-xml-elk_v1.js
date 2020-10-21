'use strict'
const cheerio=require('cheerio')
const path=require('path')
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


module.exports=(xml,sfile)=> {
    const filename = path.basename(sfile)
    const filetag = filename.replace(/^A|\.\d{4}|\-|\+\d{4}|\.xml\.gz$/g, "")

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

            if(ldnvalues.length>1){
                // if(measinfoid==="board-information"){
                const eachMeasValues=[]
                ldnvalues.forEach((ldnvalue,index2)=>{
                    //console.log(index1,index2,ldnvalue)
                    const values=$(`[measObjLdn="${ldnvalue}"]`).find('r').toArray().map(elem=>+$(elem).text())
                    const ldnobj=parseldnvalue(ldnvalue, {})
                    const ldnobjid= Object.values(ldnobj).join('_').replace(/\/|-/g,'')
                    //meansinfo_json.id=`${measinfoid.replace(/-/g,'')}_${ldnobjid}_${filetag}`
                    const ldnplusobjj=ma2j(Object.keys(ldnobj), Object.values(ldnobj),{})

                    const parseobj = ma2j(measTypes, values,ldnplusobjj)

                    //console.log(index1,index2,parseobj)
                    meansinfo_json[`${measinfoid.replace(/-/g,'')}_${ldnobjid}_${filetag}`]=parseobj
                    xml_info[`${measinfoid}_${jobid}`] = meansinfo_json




                    //if (measTypes.length===values.length) {


                    //console.log(parseobj)



                })

            }else {

                const values = $('r').toArray().map(elem => +$(elem).text())
                //structure json object  between measTypes and values bu function ma2j
                if (measTypes.length===values.length){
                    const parseobj=ma2j(measTypes, values,{})
                    //console.log(parseobj)
                    meansinfo_json[`${measinfoid.replace(/-/g,'')}_${filetag}`] = parseobj
                    xml_info[`${measinfoid}_${jobid}`] = meansinfo_json
                }

            }

        })
    })
    return xml_info
}