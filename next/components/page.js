import Head from 'next/head'
import styled from 'styled-components'

const Page = props => (
  <div {...props}>
    <Head>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, user-scalable=no"
      />
      <link
        href="https://unpkg.com/normalize.css@8.0.0/normalize.css"
        rel="stylesheet"
      />
      <title>Cheat at Set</title>
    </Head>
    {props.children}
  </div>
)

export default styled(Page)`
  font-family: system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
`
