import React from 'react'
import App, { Container } from 'next/app'
import { hot } from 'react-hot-loader'

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
      <Layout>
        <Component {...appProps}/>
      </Layout>
    </Container>)
  }
}

export default hot(module)(Myapp);
