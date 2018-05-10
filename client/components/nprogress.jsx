import React from "react";
import Head from "next/head";
import asset from 'next/asset';
import NProgress from "nprogress";
import { Router } from "../../tools/routes";


NProgress.configure({showSpinner: true});

Router.onRouteChangeStart = url => {
  console.log("routechange",url)
  NProgress.start();
};
Router.onRouteChangeComplete = () => NProgress.done();
Router.onRouteChangeError = () => NProgress.done();

export default () => (<div style={{marginBottom: 40}}>
  </div>
);
