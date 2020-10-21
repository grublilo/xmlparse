'use strict'

const fs=require('fs')
const expect =require('chai').expect

const parseRDF=require('../lib/parse-rdf')


const xml=fs.readFileSync('D:\\WebstormProjects\\xmllocal\\xmldata\\EPG_xml\\A20200814.1200+0800-1215+0800_GLPGW1.xml')


describe('parseXML',()=>{
    it('Should be a function',()=> {
        expect(parseXML).to.be.a('function')
    })
    it('MeasInfoIds list checking',()=> {
        const kpijson=parseXML(xml)
        expect(kpijson).to.be.an('object')
        expect(kpijson).to.have.a.property('node')
            .to.be.a('string').to.match(/PGW1$/)
        expect(kpijson).to.have.a.property('measInfoIds')
            .lengthOf(69)
    }).timeout(5000)
    it('Detailed checking for board-information ',()=> {
        const kpijson=parseXML(xml)
        expect(kpijson).to.have.a.property('board-information')
            .to.have.nested.property('index.1','average-cpu-usage')
        expect(kpijson).to.have.a.property('board-information')
            .to.have.nested.property('values[0][4]','/epg:epg/node/board-allocation[board=gc-0/14/1]')
        expect(kpijson).to.have.a.property('board-information')
            .to.have.nested.property('index.5','ldntag')
        expect(kpijson).to.have.a.property('board-information')
            .to.have.nested.property('values').to.be.an.instanceof(Array)
        expect(kpijson).to.have.a.property('board-information')
            .to.have.nested.property('values').with.lengthOf(11)
    }).timeout(5000)
        it('Detailed checking for pgw-traffic-apn ',()=> {
            const kpijson=parseXML(xml)
            expect(kpijson).to.have.a.property('pgw-traffic-apn')
                .to.have.nested.property('index.11','ul-packets')
            expect(kpijson).to.have.a.property('pgw-traffic-apn')
                .to.have.nested.property('values[8][8]',351634743149544)
            expect(kpijson).to.have.a.property('pgw-traffic-apn')
                .to.have.nested.property('index.17','ldntag')
            expect(kpijson).to.have.a.property('pgw-traffic-apn')
                .to.have.nested.property('values').to.be.an.instanceof(Array)
            expect(kpijson).to.have.a.property('pgw-traffic-apn')
                .to.have.nested.property('values').with.lengthOf(337)
    }).timeout(5000)
    it('Detailed checking for pgw-gre ',()=> {
        const kpijson=parseXML(xml)
        expect(kpijson).to.have.a.property('pgw-gre')
            .to.have.nested.property('index.7','gre-uplink-bytes-drops')
        expect(kpijson).to.have.a.property('pgw-gre')
            .to.have.nested.property('value[8]',0)
        expect(kpijson).to.have.a.property('pgw-gre')
            .to.have.property('index')
            .to.not.have.all.keys('9')

    }).timeout(5000)

    it('Detailed checking for ggsn-global-stats ',()=> {
        const kpijson=parseXML(xml)
        expect(kpijson).to.have.a.property('ggsn-global-stats')
            .to.have.nested.property('index.14','ggsn3gdt-active-contexts')
        expect(kpijson).to.have.a.property('ggsn-global-stats')
            .to.have.nested.property('value[11]',13985)
        expect(kpijson).to.have.a.property('ggsn-global-stats')
            .to.have.nested.property('value[8]',1187)
        expect(kpijson).to.have.a.property('ggsn-global-stats')
            .to.have.property('index')
            .to.not.have.all.keys('19')
    }).timeout(5000)

})


/**
describe('parseXML',()=>{
    it('should be a function',()=> {
        expect(parseXML).to.be.a('function')
    })
    it('should parse xml content',()=>{
        const epgkpi=parseXML(xml)
        expect(epgkpi).to.be.an('object')
        expect(epgkpi).to.have.a.property('id',132)
        expect(epgkpi).to.have.a.property('title','The Art of War')

        expect(epgkpi).to.have.a.property('authors')
            .that.is.an('array').with.lengthOf(2)
            .and.contains('Sunzi, active 6th century B.C.')
            .and.contains('Giles, Lionel')

        expect(epgkpi).to.have.a.property('subjects')
            .that.is.an('array').with.lengthOf(2)
            .and.contains('Military art and science -- Early works to 1800')
            .and.contains('War -- Early works to 1800')
    })
    it('should new expect testing',()=> {
        const epgkpinew=parseXML(xml)
        expect(epgkpinew).to.have.a.property('lcc')
            .to.be.a('string')
            .to.have.lengthOf.at.least(1)
            .to.not.be.string('I')
            .to.not.be.string('O')
            .to.not.be.string('W')
            .to.not.be.string('X')
            .to.not.be.string('Y')




    })
})
 **/
