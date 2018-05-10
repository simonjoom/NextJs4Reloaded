import React, { Component } from "react";
import Head from "next/head";
import NProgress from "./nprogress";
//import { Router } from "../../tools/routes";
import { Link } from '../../tools/routes';
import styles from "../indexstyle.scss";

class Start extends Component {
  static getInitialProps({store}) {
    //console.log(store)
   //   store.dispatch(fetchPosts());
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
        <NProgress/>
        <button
          onClick={() => {
            //  fetchPostsAction();
          }}
        >
          Click
        </button>
        <h1 className={styles.example}>{children}</h1>
        <h2>
          <Link prefetch={this.prefetch} route="post" params={{id: "fxczaz"}}>
            <a>test</a>
          </Link>
        </h2>
        <h2>
          <Link prefetch={this.prefetch} route="about">
            <a>About</a>
          </Link>
        </h2>
      </div>
    );
  }
}
export default Start;
