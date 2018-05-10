import React, { Component } from "react";
import { hot } from 'react-hot-loader'
import styles from "../indexstyle.scss";
let Page=require("../components/index.js").default;

class Index extends React.Component {
  static getInitialProps () {
    return {}
  }
  
  render () {
    return (
      <Page>Welcome on next.js hotReloaded
      </Page>
    )
  }
}
export default hot(module)(Index);
