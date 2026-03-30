import type { Metadata } from 'next'
import { Fraunces, Plus_Jakarta_Sans, Space_Mono, Inter } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
})

const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'K-slect 管理後台',
  description: 'K-slect 韓貨電商管理系統',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-TW"
      className={`${fraunces.variable} ${jakarta.variable} ${spaceMono.variable} ${inter.variable} h-full`}
    >
      <body className="h-full antialiased" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
