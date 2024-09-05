import { redirect } from "next/navigation"

async function makeAPICall(){
    const res = await fetch('http://localhost:3000/api/square/callback', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const data = await res.json()
    console.log(data)
    if (!res.ok) return undefined
    return data
}

export default async function OauthCallback(){

    const data = await makeAPICall()
    if(data){
        redirect("/dashboard")
    }

    // useEffect(() => {
    //     const makeAPICall = async () => {
    //         try {
    //             const res = await fetch('http://localhost:3000/api/square/callback', {
    //                 method: 'GET',
    //                 headers: {
    //                     'Content-Type': 'application/json'
    //                 }
    //             })
    //             const data = await res.json()
    //             console.log(res)
    //             console.log(data)
    //         } catch (error) {
    //             console.error(error)
    //         }
    //     }
        
    //     const res = makeAPICall().catch(console.error)
    // }, [])
    

    return(
        <div>
            <h1 className="text-xl">Callback</h1>
        </div>
    )
}