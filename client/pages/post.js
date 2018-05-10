/*******************************************************************************
 * Copyright (c) SkiScool
 ******************************************************************************/

import React, { Component } from "react";
import Head from "next/head";
import { Link } from '../../tools/routes';
import PropTypes from 'prop-types';
import NProgress from "../components/nprogress.jsx";
import { Router } from '../../tools/routes';

class Post extends Component {
  static getInitialProps({query, store}) {
    console.log(query)
     const { id } = query;
    //  store.dispatch(fetchPost(id));
  
    return { id };
  }
  
  render() {
    const {id,body} = this.props;
    return (
      <div>
        <Head>{id && <title>{id}</title>}</Head>
        <NProgress/>
        <button onClick={() => Router.back()}>Back</button>
        {id && (
          <div key={id}>
            <h2>{id}</h2>
            <p>{body}</p>
          </div>
        )}
        <Link route="about" prefetch>
          <a>About</a>
        </Link>
      </div>
    );
  }
}

Post.propTypes = {
  post: PropTypes.object.isRequired
}

export default Post