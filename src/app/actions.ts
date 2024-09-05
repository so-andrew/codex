'use server'
import { randomBytes } from "crypto";
import { cookies } from "next/headers"

export async function test(){
    'use server'
    let basePath: string;
    if (process.env.SQ_ENVIRONMENT!.toLowerCase() === "production") {
    basePath = `https://connect.squareup.com`;
    } else if (process.env.SQ_ENVIRONMENT!.toLowerCase() === "sandbox") {
    basePath = `https://connect.squareupsandbox.com`;
    } else {
    console.warn('Unsupported value for SQ_ENVIRONMENT in .env file.');
    process.exit(1)
    }

    const scopes = [
        "ITEMS_READ",
        "ITEMS_WRITE"
    ]

    const state = randomBytes(32).toString('hex')
    const url = basePath + `/oauth2/authorize?client_id=${process.env.SQ_APPLICATION_ID}&` + `response_type=code&` + `scope=${scopes.join('+')}` + `&state=` + state 
    cookies().set("Auth_State", state, { expires: Date.now() + 300000 })
    return url
}