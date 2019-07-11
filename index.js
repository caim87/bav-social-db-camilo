// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

// PUSH NOTIFICATIONS CONFIGURATION ------------------------
var pushConfig = {};
 
// Google Cloud Messaging (GCM)
if (process.env.GCM_SENDER_ID && process.env.GCM_API_KEY) {
    pushConfig['android'] = { senderId: process.env.GCM_SENDER_ID || '', // paste your own GCM Sender ID
                              apiKey: process.env.GCM_API_KEY || ''};  // parse your own API Key
}
 
// Apple Push Notifications (APNS)
if (process.env.APNS_ENABLE) {
    pushConfig['ios'] = [
        {
            pfx: 'ParsePushDevelopmentCertificate.p12', // set the name of your .p12 certificate
            bundleId: 'beta.codepath.parsetesting',  // set your app's Bundle Identifier
            production: false // switch it to "true" in case your .p12 certificate is a Production one
        }
    ]
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://heroku_cr6nrvxd:mhgk9dkovmktqungr99ubm2dl0@ds219181.mlab.com:19181/heroku_cr6nrvxd',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'aT69989kNiWYdMmLNFXd',
  clientKey: process.env.CLIENT_KEY || 'kigXhfwT8BJEDBs38qBE', // set your Client Key (type whatever you want)
  javascriptKey: process.env.JS_KEY || 'xrH6Svy2ozGt6OxrF0WD', // set your Javascript Key (type whatever you want)
  restAPIKey: process.env.API_REST_KEY || 'b5r5K7CL0aL3HP1j7Iij', // set your REST API key (type whatever you want)
  dotNetKey: process.env.DOT_NET_KEY || 'm2xsTHYRuEHj9J7GvGLJ', // set your .NET Key (type whatever you want)
  masterKey: process.env.MASTER_KEY || 'rYJobXciQW3sHk9cyvrZ', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'https://bav-social-db.herokuapp.com/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
