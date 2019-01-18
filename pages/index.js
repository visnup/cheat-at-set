import React from 'react'
import Head from 'next/head'
import Cheat from '../components/cheat'

export default () => (
  <div>
    <Head>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link
        href="https://unpkg.com/normalize.css@8.0.0/normalize.css"
        rel="stylesheet"
      />
    </Head>
    <Cheat />
  </div>
)
