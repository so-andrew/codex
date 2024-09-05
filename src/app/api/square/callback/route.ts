import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest){
    console.log(request)
    console.log(request.cookies)
    
    return NextResponse.json({ message: "Received" }, { status: 200 })
}