import { SignUp } from '@clerk/nextjs'
import React from 'react'

export default SignUpPage = () => {
  return (
    <main className='flex h-screen w-full items-center justify-center'>
        <SignUp/>
    </main>
  )
}
