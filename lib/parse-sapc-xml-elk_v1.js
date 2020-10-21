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
    const str_array=str.split(",")
    if(str_array.length<=1){
        object["tag"]=str
        return object

    }else{
        str_array.forEach((sub_str)=>{
            object[sub_str.split("=")[0]] = sub_str.split("=")[1]
        })
        return object
    }
}



module.exports=(xml,sfile)=> {
    const filename = path.basename(sfile)
    const filetag = filename.replace(/^A|\.\d{4}|\-|\+\d{4}|\.xml\.gz$/g, "")

    //console.log(xml)
    const $ = cheerio.load(xml)
    const xml_info = {}

    let jobids = $('job').toArray().map(elem => $(elem).attr('jobid'))
    jobids = [...new Set(jobids)]
    xml_info.jobids = jobids
    //console.log(jobids)
    //const jobid_css=`[jobId="${jobid}"]`
    xml_info.node = $('managedElement', 'measData').attr('localdn')
    xml_info.begintime = $('measCollec', 'fileHeader').attr('begintime')

    xml_info.filename = filename
    jobids.forEach((jobid) => {
        //const jobidstr=jobid.toLowerCase()
        //console.log(jobid)
        const jobid_css = `[jobId="${jobid}"]`
        //const measInfos=$('[jobId="33_USERDEF.SAPC.Profile_33.Continuous_Y.MEASJOB"]').parent().toArray()
        const measInfos = $(jobid_css).parent().toArray()
        //const measInfos = $(`[jobId=jobid]`).parent().toArray()

        //xml_info[`measInfoIds_${jobid}`] = $(`[jobId=${jobid}]`)
        xml_info[`measInfoIds_${jobid}`] = $(jobid_css)
            .parent().toArray().map(elem => $(elem).attr('measinfoid'))


        measInfos.forEach((meansinfo, index1) => {
            const $ = cheerio.load(meansinfo),
                time = $('granPeriod').attr('endtime'),
                duration = $('granPeriod').attr('duration'),
                measinfoid = $('measInfo').attr('measinfoid'),

                meansinfo_json = {},
                ldnvalues = $('measValue').toArray().map(elem => $(elem).attr('measobjldn')),
                measTypes = $('measType').toArray().map(elem => $(elem).text())

            meansinfo_json.time = time
            meansinfo_json.duration = duration

            meansinfo_json.index = {"_id": `${measinfoid}`}
            //console.log(index1, meansinfo_json,measTypes,ldnvalues)
            //console.log(meansinfo_json)


            if (ldnvalues.length >= 1) {
                if (measinfoid !== "policyControlFunctionCapacityMeasuresGroup" && measinfoid !==  "policyControlFunctionExtDbMeasuresGroup") {
                    const eachMeasValues = []
                    ldnvalues.forEach((ldnvalue, index2) => {
                        //console.log(index1, index2, ldnvalue)
                        const values = $(`[measObjLdn="${ldnvalue}"]`).find('r').toArray().map(elem => +$(elem).text())
                        //console.log(ldnvalue)
                        const ldnobj =  parseldnvalue(ldnvalue, {})
                        const ldnobjid = Object.values(ldnobj).join('_').replace(/\/|-/g, '')
                        //meansinfo_json.id=`${measinfoid.replace(/-/g,'')}_${ldnobjid}_${filetag}`
                        const ldnplusobjj = ma2j(Object.keys(ldnobj), Object.values(ldnobj), {})

                        //if (measTypes.length===values.length) {
                        const parseobj = ma2j(measTypes, values, ldnplusobjj)

                        parseobj.id = `${measinfoid.replace(/-/g, '')}_${ldnobjid}_${filetag}`
                        //eachMeasValues.push(parseobj)

                        meansinfo_json[`${measinfoid.replace(/-/g, '')}_${ldnobjid}_${filetag}`] = parseobj
                    })
                    xml_info[`${measinfoid}_${jobid}`] = meansinfo_json
                } else {
                    const values = $('r').toArray().map(elem => +$(elem).text())
                    //console.log(measTypes, values)
                    //structure json object  between measTypes and values bu function ma2j
                    if (measTypes.length === values.length) {
                        const parseobj = ma2j(measTypes, values, {})
                        //console.log(parseobj)
                        meansinfo_json[`${measinfoid.replace(/-/g, '')}_${filetag}`] = parseobj
                        xml_info[`${measinfoid}_${jobid}`] = meansinfo_json
                    }
                }

            }
        /**
            else {
                const values = $('r').toArray().map(elem => +$(elem).text())
                if (measTypes.length === values.length) {
                    const parseobj = ma2j(measTypes, values, {})
                    //console.log(parseobj)
                    meansinfo_json[`${measinfoid.replace(/-/g, '')}_${filetag}`] = parseobj
                    xml_info[`${measinfoid}_${jobid}`] = meansinfo_json
                }
            }**/

        })

    })
    return xml_info

}