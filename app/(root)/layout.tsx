import StreamVideoProvider from '@/providers/StreamClientProvider'
import React, { ReactNode } from 'react'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "synq",
  description: "video calling app",
  icons : {
    icon : '/icons/logo.svg',
  }
};

export default function RootLayout = ({children} : {children : ReactNode}) => {
  return (
    <main>
       <StreamVideoProvider>
          {children}
       </StreamVideoProvider>
    </main>
  )
}
