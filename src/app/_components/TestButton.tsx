'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

const TestButton = () => {

    const [href, setHref] = useState('')

    useEffect(() => {
        const getUrl = async () => {
            const res = await fetch("http://localhost:3000/api/request_token")
            const { url } = await res.json()

            console.log(url)
            setHref(url)
        }

        getUrl().catch(console.error)
    }, [])
    


    return (
        <Link href={href}>
            <div>TestButton</div>
        </Link>
    )
}

export default TestButton