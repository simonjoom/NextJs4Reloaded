import React, { Component } from "react";
import { hot } from 'react-hot-loader'
import styles from "../indexstyle.scss";
let Page=require("../components/index.js").default;

class Index extends React.Component {
  static getInitialProps () {

    // console.log(Router.pathname)
    return {}
  }
  
  render () {
    console.log("renderIndex")
    return (
      <Page>Welcome on next.js hotReloaded
      </Page>
    )
  }
}

 export default hot(module)(Index);
 

//export default () => <Start>Welcome to next.js!!</Start>

//export const App = require("../static/css/nprogress.css");
//export default () => (<Start>Welcome to next.js!!</Start>)
//export default () =>

/* {posts.length > 0 &&
        posts.map(post => (
          <div key={post.id}>
            <h2>
              <Link prefetch route="post" params={{ id: post.id }}>
                <a>{post.title}</a>
              </Link>
            </h2>
            <p>{post.body}</p>
          </div>
        ))}*/
