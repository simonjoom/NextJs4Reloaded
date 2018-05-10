import React, { Component } from "react";
import Head from "next/head";
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
        <button
          onClick={() => {
            //  fetchPostsAction();
          }}
        >
          Click
        </button>
        <h1 className={styles.example}>{children}</h1>
        <p>To see feature working <br/>
        This is to be runned with "npm run dev" only (i didn't work and test still for production for the moment)
        </p>
        <ul><li> you can change something in pages/_app.js or pages/index.js to see the hot-reload in action</li>
        <li> you can change something in static/css/nprogress.css to see the hot-reload in action on the static css</li>
        <li> you can change something in indexstyle.scss to see the hot-reload in action on dynamic style in component</li>
        </ul>
        Watch the console to see HMR2 hacked for webpack4 and nextjs
        <p>
          This boilerplate use nextjs versius developpement mode, with babel and their sourcemaps,.<br/>
          
          It's a boilerplate not for framework style.. so just for some people want to dig more in nextjs code and who want to avoid black-out.<br/>
          
          I taked off the feature build ondemand... just because it's complicate and i guess source of bug in hard developpement of nextjs
          This boilerplate plug nextjs directly in his code, just to make more fun to developp nextjs and try to debug it.<br/>
          (there is no version 'dist babelified' all is babelified on run time so the build is bit much smaller<br/>
          This boilerplate use next-routes. The route are stored in /tools/routes<br/>
          Inside _app layout i added the very useful nprogress, he is working for all pages routes.
        </p>
        
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
