'use strict'
const cheerio=require('cheerio')

module.exports=xml=>{
    const $=cheerio.load(xml)
    const xml_info={}
    xml_info.node=$('managedElement','measData').attr('localdn')
    xml_info.begintime=$('measCollec','fileHeader').attr('begintime')
    xml_info.jobId="epg-all"
    xml_info.measInfoIds=$('[jobId="epg-all"]')
            .parent().toArray().map(elem=>$(elem).attr('measinfoid'))

    const measInfos=$('[jobId="epg-all"]').parent().toArray()
    measInfos.forEach((meansinfo,index)=> {
        const $ = cheerio.load(meansinfo)
        global.time = $('granPeriod').attr('endtime'),
            global.duration = $('granPeriod').attr('duration')
        const measinfoid = $('measInfo').attr('measinfoid'),
            meastypes = {},
            eachMeasValues=[]
        $('measType').toArray().map(elem => (meastypes[+$(elem).attr('p')] = $(elem).text()))
        const meastype_length=Object.keys(meastypes).length+1

        const ldnvalues=$('measValue').toArray().map(elem=> $(elem).attr('measobjldn'))
        if(ldnvalues.length>1){
            meastypes[meastype_length]='ldntag'
            const ldnsmeasvalue=$('measValue').toArray()
            ldnsmeasvalue.forEach((ldnmeasvalue,subindex)=>{
                const $=cheerio.load(ldnmeasvalue),
                    ldnvalue=$('measValue').attr('measobjldn'),
                    measvalues=$('r').toArray().map(elem=>+$(elem).text())
                measvalues.push(ldnvalue)
                eachMeasValues.push(measvalues)
            })
            xml_info[measinfoid] = {'index':meastypes,'values':eachMeasValues}
        }
        else{
            const measvalues={}
            $('r').toArray().map(elem=>(measvalues[$(elem).attr('p')]=+$(elem).text()))
            eachMeasValues.push(measvalues)
            xml_info[measinfoid] = {'index':meastypes,'value':eachMeasValues[0]}
        }
    })
    xml_info['time']=global.time
    xml_info['duration']=global.duration
    return xml_info

}