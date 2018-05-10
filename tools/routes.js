/*******************************************************************************
 * Copyright (c) SkiScool
 ******************************************************************************/
// routes.js

const nextRoutes = require('next-routes');
const routes = module.exports = nextRoutes()
//routes.add('index', '/')
routes.add('login', '/login')
routes.add('about', '/about')
routes.add("post", "/post/:id");
/*
if(module.hot) {
  
 var acceptedDepencies = ['../client/pages/index.js'];
  
  module.hot.accept(acceptedDepencies, function() {
    // require again...
    require('../client/pages/index.js').default;
    //require('../client/pages/index.js');
  });
}*/