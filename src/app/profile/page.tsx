import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'
import { auth, currentUser } from '@clerk/nextjs/server'
import Link from 'next/link';
import { randomBytes } from "crypto";
import { cookies } from "next/headers"
import TestButton from '../_components/TestButton';
//import { test } from '../actions'

export default async function ProfilePage(){

    const { userId } = auth()

    //const user = await currentUser()
    //console.log(user)

    return (
        <section>
            <SignedIn>
                <div className='flex flex-col items-center gap-8 py-4 min-h-screen'>
                    <h1 className="font-semibold text-2xl">Profile</h1>
                    <p>{userId}</p>
                    <TestButton/>
                </div>
            </SignedIn>
            <SignedOut>
                <RedirectToSignIn/>
            </SignedOut>
        </section>
    )
}