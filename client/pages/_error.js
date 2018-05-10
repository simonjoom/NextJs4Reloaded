import React from 'react'
import { hot } from 'react-hot-loader'
import Header from 'next/head'
//import Router from 'next/router'

class Errors extends React.Component {
  static getInitialProps () {
   // console.log(Router.pathname)
    return {}
  }

  render () {
    return (
      <div>
        <Header />
        <p>This should not be rendered via SSR</p>
      </div>
    )
  }
}

export default hot(module)(Errors);