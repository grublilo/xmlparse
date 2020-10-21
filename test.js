const delay =(timeout=0,success=true)=>{
    const promise = new Promise((resolve,reject) =>{
        setTimeout(()=>{
            if(success){
                resolve(`RESPLVED after ${timeout}`)

            }else{
                reject(`REJECTRED after${timeout}`)

            }

        },timeout)

    })
    return promise
}

const usedelay = ()=>{
    delay(500,true)
        .then(msg=>console.log(msg))
        .catch(err=>console.log(err))
}

const useDelay = async ()=>{
    try {
        const msg = await delay(500, true)
        console.log(msg)
    }catch(err){
        console.log(err)
    }
}


