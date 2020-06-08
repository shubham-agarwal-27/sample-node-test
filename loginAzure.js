// 'use strict';

var request = require('request');
var express = require('express');
// var logger = require('connect-logger');
// var cookieParser = require('cookie-parser');
// var session = require('cookie-session');
// var fs = require('fs');
// var crypto = require('crypto');



var app = express();

async function getUserDetails(){
	// var file_content = await getFileContent('give_inputs.txt');
	// var split_input = file_content[0].replace(/\s+/g, '').split(":");
	// if(!split_input[1].endsWith('$$'))
	// 	await getGitHubPAT(userDetails);
	// else
	// 	userDetails[split_input[0]] = split_input[1].split('$')[0];
	// console.log("Your github Pat token is : " + userDetails['Github_PAT'].slice(0, 4) + '.......');
	return new Promise(function(resolve) {
		const { exec } = require('child_process');
		exec('git config --list', (error, stdout, stderr) => {
			var array_stdout = stdout.split("\n");
			for(var single_info of array_stdout){
				var info_splitted = single_info.split("=");
				if(info_splitted[0] === 'user.name'){
					userDetails['username'] = info_splitted[1];
				}

				if(info_splitted[0] === 'user.email'){
					userDetails['user_email'] = info_splitted[1];
				}

				if(info_splitted[0] === 'remote.origin.url'){
					userDetails['repo_name'] = info_splitted[1].split("https://github.com/")[1].split("/")[1].split(".")[0];
				}
			}
			resolve();
		});
  	});
}
function openSignInLink(){
	return new Promise(resolve => {
		opn('https://login.microsoftonline.com/common/oauth2/authorize?client_id='+client_id+'&response_type=code&redirect_uri=http://localhost:3000/callback&response_mode=query&scope='+scope+'&state=AzureShubhamLogIn');
		// opn('https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=f64517c8-4cb9-4149-b29e-4a3ee66e7133&response_type=id_token+code&redirect_uri=https://localhost:3000/callback&response_mode=query&scope=offline_access%20user.read%20user_impersonation&state=AzureShubhamLogIn');	
		resolve();
	});
}
function getCallback(){
	return new Promise(resolve => {
		app.get('/callback', function(req, res){
			code = req.query['code'];
			res.send("You are logged in, now you can go back to your terminal!");
			resolve();
		});
	});
}

function getPublishProfile(){
  const options = {
		uri: 'https://management.azure.com/subscriptions/393a91ee-f98d-43ff-b964-009bda0fdf2e/resourceGroups/ShubagAzure/providers/Microsoft.Web/sites/shubagmicrosoft/publishxml?api-version=2015-08-01',
		json: true,
		body: 'client_id='+client_id+'&scope='+scope+'&redirect_uri=http://localhost:3000/callback&code='+code+'&grant_type=authorization_code',
		headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: 
		}
	};
	
	return new Promise(resolve => {
		request.post(options, (err, res, body) => {
			if (err) {
				return console.log(err);
			}
			// console.log(`Status: ${res.statusCode}`);
			// userDetails['azure_details'] = body;
			console.log(body);
			resolve();
		});	
	});
}

(async function(){
  await getPublishProfile();
})();
































// var AuthenticationContext = require('adal-node').AuthenticationContext;

// var app = express();
// app.use(logger());
// app.use(cookieParser('a deep secret'));
// app.use(session({secret: '1234567890QWERTY'}));

// app.get('/', function(req, res) {
//   res.redirect('login');
// });

// var sampleParameters = {
//     tenant : '72f988bf-86f1-41af-91ab-2d7cd011db47',
//     clientId : 'a9c73ef8-fd2a-41c5-9277-78cc88362b49',
//     authorityHostUrl : 'https://login.windows.net',
//     clientSecret : 'F-.hUpuBvoL.iuG.ro.2r9fd4yEzbu2F2b',
//     username: 't-shubag@microsoft.com'
// };
// // var tenant = '72f988bf-86f1-41af-91ab-2d7cd011db47';
// // const clientId = 'a9c73ef8-fd2a-41c5-9277-78cc88362b49';
// // var authorityHostUrl = 'https://login.windows.net';
// // var clientSecret = 'F-.hUpuBvoL.iuG.ro.2r9fd4yEzbu2F2b';
// var authorityUrl = sampleParameters.authorityHostUrl + '/' + sampleParameters.tenant;
// var redirectUri = 'http://localhost:3000/callback';
// var resource = '393a91ee-f98d-43ff-b964-009bda0fdf2e';
// var templateAuthzUrl = 'https://login.windows.net/' + sampleParameters.tenant + '/oauth2/authorize?response_type=code&client_id=<client_id>&redirect_uri=<redirect_uri>&state=<state>&resource=<resource>';


// app.get('/login', function(req, res) {
//     console.log(req.cookies);  
//     res.cookie('acookie', 'this is a cookie');
//     res.send('\
//     <head>\
//         <title>test</title>\
//     </head>\
//     <body>\
//         <a href="./auth">Login</a>\
//     </body>\
//     ');
//   });

// function createAuthorizationUrl(state) {
//     var authorizationUrl = templateAuthzUrl.replace('<client_id>', sampleParameters.clientId);
//     authorizationUrl = authorizationUrl.replace('<redirect_uri>',redirectUri);
//     authorizationUrl = authorizationUrl.replace('<state>', state);
//     authorizationUrl = authorizationUrl.replace('<resource>', resource);
//     return authorizationUrl;
// }

// app.get('/auth', function(req, res) {
//     crypto.randomBytes(48, function(ex, buf) {
//       var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
//       res.cookie('authstate', token);
//       var authorizationUrl = createAuthorizationUrl(token);
//       res.redirect(authorizationUrl);
//     });
// });

// app.get('/callback', function(req, res) {
//     if (req.cookies.authstate !== req.query.state) {
//       res.send('error: state does not match');
//     }
//     console.log("code");
//     console.log(req.query.code);
//     var authenticationContext = new AuthenticationContext(authorityUrl);
//     authenticationContext.acquireTokenWithAuthorizationCode(req.query.code, redirectUri, resource, sampleParameters.clientId, sampleParameters.clientSecret, function(err, response) {
//       var message = '';
//       if (err) {
//         message = 'error: ' + err.message + '\n';
//       }
//       message += 'response: ' + JSON.stringify(response);
  
//       if (err) {
//         res.send(message);
//         return;
//       }
  
//       // Later, if the access token is expired it can be refreshed.
//       authenticationContext.acquireTokenWithRefreshToken(response.refreshToken, sampleParameters.clientId, sampleParameters.clientSecret, resource, function(refreshErr, refreshResponse) {
//         if (refreshErr) {
//           message += 'refreshError: ' + refreshErr.message + '\n';
//         }
//         message += 'refreshResponse: ' + JSON.stringify(refreshResponse);
//         res.send(message); 
//       }); 
//     });
//   });

// app.listen(3000);
// console.log('listening on 3000');


