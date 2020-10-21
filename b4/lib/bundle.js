'use strict'

const rp=require('request-promise')
module.exports=(app,es)=>{

    const url=`http://${es.host}:${es.port}/${es.bundles_index}/bundle`

    app.post('/api/bundle',(req,res)=>{
        const bundle={
            name: req.query.name || '',
            books: [],
        }

        rp.post({url,body:bundle,json:true})
            .then(esResBody => res.status(201).json(esResBody))
            .catch(({error})=>res.status(error.status|| 502).json(error))

    })


    app.get('/api/bundle/:id',async (req,res)=>{
        const options={
            url: `${url}/${req.params.id}`,
            json: true
        }
        try{
            const esResBody= await rp(options)
            res.status(200).json(esResBody)
        }catch(esResErr){
            res.status(esResErr.statusCode || 502).json(esResErr.error)
        }

    })

    app.put('/api/bundle/:id/name/:name',async(req,res)=>{

        //const bundleuRL=`${url}/${req.params.id}`
        const options={
            url: `${url}/${req.params.id}`,
            json: true
        }

        try {
            const bundle= (await rp(options))._source
            bundle.name=req.params.name
            options.body=bundle
            const esResBody= await rp.put(options)
            res.status(200).json(esResBody)

        }catch(esResErr){
            res.status(esResErr.statusCode || 502).json(esResErr.error)

        }


    })

    app.put('/api/bundle/:id/book/:pgid',async(req,res)=>{
        const bundleoptions={url:`${url}/${req.params.id}`,json:true}
        const bookoptions={url:`http://${es.host}:${es.port}/${es.books_index}/book/${req.params.pgid}`,json:true}

        try{
            const [bundleRes,bookRes] = await Promise.all(
                [
                    rp(bundleoptions),
                    rp(bookoptions)
                ]
            )
            const {_source:bundle,_version:version} =bundleRes
            const {_source:book}=bookRes

            const idx= bundle.books.findIndex(book=>book.id===req.params.pgid)
            if(idx===-1){
                bundle.books.push({
                    id: req.params.pgid,
                    title: book.title
                })
            }
            //bundleoptions.qs=version
            //bundleoptions._seq_no= 0
            //bundleoptions._primary_term=1

            bundleoptions.body=bundle


           // console.log(bundleoptions)
            const esResBody = await rp.put(bundleoptions)
            res.status(200).json(esResBody)

        }catch(esResErr){
            res.status(esResErr.statusCode || 502 ).json(esResErr.error)

        }

    })


    app.delete('/api/bundle/:id',async(req,res)=>{
        const options={
            url: `${url}/${req.params.id}`,
            json: true
        }
        try{
            const esResBody= await rp.delete(options)
            res.status(200).json(esResBody)
        }catch(esResErr){
            res.status(esResErr.statusCode || 502).json(esResErr.error)
        }

    })


    app.delete('/api/bundle/:id/book/:pgid',async(req,res)=>{
        const bundlebookoptions={url:`${url}/${req.params.id}`,json:true}

        try{
            const bundle= (await rp(bundlebookoptions))._source
            const idx= bundle.books.findIndex(book=>book.id===req.params.pgid)

            if(idx===-1){
                throw {
                    statusCode: 409,
                    error:{
                        reason: 'Conflict -Bundle does not contain that book'
                    }
                }
            }

            bundle.books.splice(idx,1)
            bundlebookoptions.body=bundle

            const esResBody = await rp.put(bundlebookoptions)

            res.status(200).json(esResBody)
        }catch(esResErr){
            res.status(esResErr.statusCode || 502 ).json(esResErr.error)

        }

    })


}