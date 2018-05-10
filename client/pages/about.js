/*******************************************************************************
 * Copyright (c) SkiScool
 ******************************************************************************/

import React, { Component } from "react";
import { hot } from 'react-hot-loader'
import Head from "next/head";
import NProgress from "../components/nprogress.jsx";
import styles from "../indexstyle.scss";

//import styles from "./index.scss";
import { Link } from '../../tools/routes';

class About extends Component {
  static getInitialProps({store}) {
    console.log("", store)
    //  store.dispatch(fetchPosts());
  }

  componentDidMount() {
    this.prefetch = true;
  }

  render() {
    const {children} = this.props;
    return (
      <div>
        <Head>
          <title>{children}</title>
        </Head>
        <h1 className={styles.example}>{children}</h1>
        <h2>
          <Link route="post" params={{id: "about"}}>
            <a>aadzd</a>
          </Link>
        </h2>
        <h2>
          <Link route="about">
            <a>Abouta</a>
          </Link>
        </h2>
      </div>
    );
  }
}

export default  hot(module)(() => <About>Welcome to About!!</About>);

/*{posts.length > 0 &&
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
