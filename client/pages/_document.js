 import React from 'react'
 import Document, { Head, Main, NextScript } from 'next/document'


export default class MyDocument extends Document {
    static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }
  render () {
    return <html>
      <Head>
        <link rel="stylesheet" href="/_next/webpack/style.css" />
          <style>{`body { margin: 0 } /* custom! */`}</style>
            </Head>
      <body className="custom_class" id="trace">
        <Main />
        <NextScript />
      </body>
    </html>
  }
}


