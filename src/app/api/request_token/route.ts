import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

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

export async function GET(request: NextRequest){
    const { userId } = auth()

    if(!userId){
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const state = randomBytes(32).toString('hex')
    const url = basePath + `/oauth2/authorize?client_id=${process.env.SQ_APPLICATION_ID}&scope=${scopes.join('%20')}&session=false&state=${state}` 
    
    // console.log(url)

    cookies().set("Auth_State", state, { expires: Date.now() + 300000 })

    return NextResponse.json({ url: url }, { status: 200 })

}