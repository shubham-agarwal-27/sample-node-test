'use strict';

var express = require('express');
var logger = require('connect-logger');
var cookieParser = require('cookie-parser');
var session = require('cookie-session');
var fs = require('fs');
var crypto = require('crypto');

var AuthenticationContext = require('adal-node').AuthenticationContext;

var app = express();
app.use(logger());
app.use(cookieParser('a deep secret'));
app.use(session({secret: '1234567890QWERTY'}));

app.get('/', function(req, res) {
  res.redirect('login');
});

var sampleParameters = {
    tenant : '72f988bf-86f1-41af-91ab-2d7cd011db47',
    clientId : 'a9c73ef8-fd2a-41c5-9277-78cc88362b49',
    authorityHostUrl : 'https://login.windows.net',
    clientSecret : 'F-.hUpuBvoL.iuG.ro.2r9fd4yEzbu2F2b',
    username: 't-shubag@microsoft.com'
};
// var tenant = '72f988bf-86f1-41af-91ab-2d7cd011db47';
// const clientId = 'a9c73ef8-fd2a-41c5-9277-78cc88362b49';
// var authorityHostUrl = 'https://login.windows.net';
// var clientSecret = 'F-.hUpuBvoL.iuG.ro.2r9fd4yEzbu2F2b';
var authorityUrl = sampleParameters.authorityHostUrl + '/' + sampleParameters.tenant;
var redirectUri = 'http://localhost:3000/callback';
var resource = '393a91ee-f98d-43ff-b964-009bda0fdf2e';
var templateAuthzUrl = 'https://login.windows.net/' + sampleParameters.tenant + '/oauth2/authorize?response_type=code&client_id=<client_id>&redirect_uri=<redirect_uri>&state=<state>&resource=<resource>';


app.get('/login', function(req, res) {
    console.log(req.cookies);  
    res.cookie('acookie', 'this is a cookie');
    res.send('\
    <head>\
        <title>test</title>\
    </head>\
    <body>\
        <a href="./auth">Login</a>\
    </body>\
    ');
  });

function createAuthorizationUrl(state) {
    var authorizationUrl = templateAuthzUrl.replace('<client_id>', sampleParameters.clientId);
    authorizationUrl = authorizationUrl.replace('<redirect_uri>',redirectUri);
    authorizationUrl = authorizationUrl.replace('<state>', state);
    authorizationUrl = authorizationUrl.replace('<resource>', resource);
    return authorizationUrl;
}

app.get('/auth', function(req, res) {
    crypto.randomBytes(48, function(ex, buf) {
      var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
      res.cookie('authstate', token);
      var authorizationUrl = createAuthorizationUrl(token);
      res.redirect(authorizationUrl);
    });
});

app.get('/callback', function(req, res) {
    if (req.cookies.authstate !== req.query.state) {
      res.send('error: state does not match');
    }
    console.log("code");
    console.log(req.query.code);
    var authenticationContext = new AuthenticationContext(authorityUrl);
    authenticationContext.acquireTokenWithAuthorizationCode(req.query.code, redirectUri, resource, sampleParameters.clientId, sampleParameters.clientSecret, function(err, response) {
      var message = '';
      if (err) {
        message = 'error: ' + err.message + '\n';
      }
      message += 'response: ' + JSON.stringify(response);
  
      if (err) {
        res.send(message);
        return;
      }
  
      // Later, if the access token is expired it can be refreshed.
      authenticationContext.acquireTokenWithRefreshToken(response.refreshToken, sampleParameters.clientId, sampleParameters.clientSecret, resource, function(refreshErr, refreshResponse) {
        if (refreshErr) {
          message += 'refreshError: ' + refreshErr.message + '\n';
        }
        message += 'refreshResponse: ' + JSON.stringify(refreshResponse);
        res.send(message); 
      }); 
    });
  });

app.listen(3000);
console.log('listening on 3000');


