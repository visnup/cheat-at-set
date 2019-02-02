import Head from 'next/head'

export default props => (
  <div {...props}>
    <Head>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, user-scalable=no"
      />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <link
        href="https://unpkg.com/normalize.css@8.0.0/normalize.css"
        rel="stylesheet"
      />
      <title>Cheat at Set</title>
    </Head>
    {props.children}
    <style jsx>{`
      font-family: system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
    `}</style>
  </div>
)
