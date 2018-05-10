import React from 'react'
import App, { Container } from 'next/app'
import { hot } from 'react-hot-loader'
import NProgress from "../components/nprogress";

class Layout extends React.Component {
  render() {
    const {children} = this.props
    return <div className='layout'>
      {children}
    </div>
  }
}

//const MyLayout=hot(module)(Layout);

class Myapp extends App {
  render() {
    //const {children} = this.props;
    const {Component, appProps} = this.props;
    return (<Container>
      <NProgress/>
      <Layout>
        <Component {...appProps}/>
      </Layout>
    </Container>)
  }
}

export const styleGlobal = require("../static/css/nprogress.css");
export default hot(module)(Myapp);
