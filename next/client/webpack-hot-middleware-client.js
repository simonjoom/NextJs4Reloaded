import 'event-source-polyfill'
import webpackHotMiddlewareClient from 'webpack-hot-middleware/client?autoConnect=false&overlay=false&reload=true'
import Router from '../lib/router'

const {
  __NEXT_DATA__: {
    assetPrefix
  }
} = window



var failureStatuses = { abort: 1, fail: 1 };
var applyOptions = {
  ignoreUnaccepted: true,
  ignoreDeclined: true,
  ignoreErrored: true,
  onUnaccepted: function(data) {
    console.warn("Ignored an update to unaccepted module " + data.chain.join(" -> "));
  },
  onDeclined: function(data) {
    console.warn("Ignored an update to declined module " + data.chain.join(" -> "));
  },
  onErrored: function(data) {
    console.error(data.error);
    console.warn("Ignored an error while updating module " + data.moduleId + " (" + data.type + ")");
  }
}
var checktest= function(mod) {
  if (mod.hot.status() == "idle") {
    console.log("[HMR2] Checking for updates"+mod.i+ " on the server...");
   check();
  }

  function check() {
    var cb = function(err, updatedModules) {
      if (err) return handleError(err);

      if(!updatedModules) {
        console.warn("[HMR2] Cannot find update (Full reload needed)");
        console.warn("[HMR2] (Probably because of restarting the server)");
        // performReload();
        return null;
      }

      var applyCallback = function(applyErr, renewedModules) {
        if (applyErr) return handleError(applyErr);

        // if (!upToDate()) check();

        logUpdates(updatedModules, renewedModules);
      };

      var applyResult = mod.hot.apply(applyOptions, applyCallback);
      // webpack 2 promise
      if (applyResult && applyResult.then) {
        // HotModuleReplacement.runtime.js refers to the result as `outdatedModules`
        applyResult.then(function(outdatedModules) {
          applyCallback(null, outdatedModules);
        });
        applyResult.catch(applyCallback);
      }

    };

    var result = mod.hot.check(false, cb);
    // webpack 2 promise
    if (result && result.then) {
      result.then(function(updatedModules) {
        cb(null, updatedModules);
      });
      result.catch(cb);
    }
  }

  function logUpdates(updatedModules, renewedModules) {
    var unacceptedModules = updatedModules.filter(function(moduleId) {
      return renewedModules && renewedModules.indexOf(moduleId) < 0;
    });

    if(unacceptedModules.length > 0) {
      console.warn(
        "[HMR] The following modules couldn't be hot updated: " +
        "(Full reload needed)\n" +
        "This is usually because the modules which have changed " +
        "(and their parents) do not know how to hot reload themselves. " +
        "See " + hmrDocsUrl + " for more details."
      );
      unacceptedModules.forEach(function(moduleId) {
        console.warn("[HMR]  - " + moduleId);
      });
      //performReload();
      return;
    }
    if(!renewedModules || renewedModules.length === 0) {
      console.log("[HMR2] Nothing hot updated.");
    } else {
      console.log("[HMR2] Updated modules:");
      renewedModules.forEach(function(moduleId) {
        console.log("[HMR2]  - " + moduleId);
      });

      /*if (upToDate()) {
        console.log("[HMR] App is up to date.");
      }*/
    }
  }
  function handleError(err) {
    if (mod.hot.status() in failureStatuses) {
      console.warn("[HMR2] Cannot check for update (Full reload needed)");
      console.warn("[HMR2] " + err.stack || err.message);
      // performReload();
      return;
    }
    console.warn("[HMR2] Update check failed: " + err.stack || err.message);

  }

  function performReload() {
    console.warn("[HMR2] Reloading page");
    window.location.reload();
  }
}

var myHandler;
export default () => {
  webpackHotMiddlewareClient.setOptionsAndConnect({
    path: `${assetPrefix}/_next/webpack/webpack-hmr`
  })

  const handlers = {
    reload (route) {
      if (route === '/_error') {
        for (const r of Object.keys(Router.components)) {
          const { err } = Router.components[r]
          if (err) {
            // reload all error routes
            // which are expected to be errors of '/_error' routes
            Router.reload(r)
          }
        }
        return
      }

      // If the App component changes we have to reload the current route
      if (route === '/_app') {
        Router.reload(Router.route)
        return
      }

      // Since _document is server only we need to reload the full page when it changes.
      if (route === '/_document') {
        window.location.reload()
        return
      }

      Router.reload(route)
    },

    change (route) {

    if(window.storemod[route]){
function myHand(route) {
var th=window.storemod[route];console.log(th.i+" status="+th.hot.status());
checktest(th)
}
if(myHandler)
 window.webpackModule.hot.removeStatusHandler(myHandler);
myHandler=function(){myHand(route);}
 window.webpackModule.hot.addStatusHandler(myHandler);
 }
      // If the App component changes we have to reload the current route
      if (route === '/_app') {
     //TODO. Reload done with hotreload
     //    Router.reload(Router.route)
        return
      }

      // Since _document is server only we need to reload the full page when it changes.
      if (route === '/_document') {
        window.location.reload()
        return
      }

      const { err, Component } = Router.components[route] || {}

      if (err) {
        // reload to recover from runtime errors
        Router.reload(route)
      }

      if (Router.route !== route) {
        // If this is a not a change for a currently viewing page.
        // We don't need to worry about it.
        return
      }

      if (!Component) {
        // This only happens when we create a new page without a default export.
        // If you removed a default export from a exising viewing page, this has no effect.
        console.log(`Hard reloading due to no default component in page: ${route}`)
        window.location.reload()
      }
    }
  }

  webpackHotMiddlewareClient.subscribe((obj) => {
    const fn = handlers[obj.action]
    if (fn) {
      const data = obj.data || []
      fn(...data)
    } else {
      throw new Error('Unexpected action ' + obj.action)
    }
  })
}
