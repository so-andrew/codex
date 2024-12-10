import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import TestButton from '../_components/TestButton'
//import { test } from '../actions'

export default async function ProfilePage() {
    const { userId } = await auth()

    return (
        <section>
            <SignedIn>
                <div className="flex min-h-screen flex-col items-center gap-8 py-4">
                    <h1 className="text-2xl font-semibold">Profile</h1>
                    <p>{userId}</p>
                    <TestButton />
                </div>
            </SignedIn>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
        </section>
    )
}
