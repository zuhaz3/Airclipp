// TODO --> Technical Debt, break into routers and app config files
// Use socket.io to make everything realtime
// Create API to read + write (add perms later)
// Upload files with location and dashboard for user

// IMMEDIATE
// Add bookmarks panel
// Add "attach multiple files" option in upload page
// Add editing for dashboard
// USE Geocoding for geofencing (as in use the city) so less load on server when looking up all files --> just look up files in city (later more specific geofencing) will be easier
// MOMENT JS NEEDED FOR READABLE TIME WITH THEIR time attr and also remove all other time libraries and fix it up completely
// Allow option to choose location where file should be uploaded - use Trakr map
// Also LATER allow options for payments, encryption etc. 
// (check) Display files --> create API that takes lat and lng to display files near you
// Dashboard, with account/profile information and options to edit files you uploaded --> gelocation coordinates --> delete option
// (working) Timestamp to human readable text -- around the world with all timezones
// (Need view still) Actions for file
// 404 not working --> fix
// Think about distance formula and what each degree of lat lng will be. Specify a radius for the user
// Then work on file model/schema
// Need to think about how this can be done

// For internal API read only security use a random generated token and pass it to website with templating and then that will be in use for that session

var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , request = require('request')
  , mongoose = require('mongoose')
  , FacebookStrategy = require('passport-facebook').Strategy;

var FACEBOOK_APP_ID = "536020333148727"
var FACEBOOK_APP_SECRET = "ba7b40249abb2d1e7959268f5ae09047";

// MongoDB set up

var uri = 'mongodb://localhost/airclipp';

var apiAccessToken; 

mongoose.connect(uri, function(err, res) {
    if(err) 
      console.log("Error connecting to MongoDB: " + err);
    else
      console.log('Connected to MongoDB');
});

var userSchema = mongoose.Schema({
    name: String,
    email: String,
    timezone: Number,
    verified: Boolean,
    provider: String,
    id: String
});

var User = mongoose.model('User', userSchema);

var fileSchema = mongoose.Schema({
    name: String,
    description: String,
    author: String,
    authorId: Number,
    latlng: String,
    url: String,
    timestamp: String // Change this to number for milliseconds better for future
});

var File = mongoose.model('File', fileSchema);

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    scope: "email"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      profile.accessToken = accessToken;
      
      // To keep the example simple, the user's Facebook profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Facebook account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

var app = express();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res){
  if (!req.user) 
    res.render('index', { user: req.user });
  else {
    User.find({ email: req.user._json.email }, function (req1, res1) {
      if (res1[0]) res.redirect('/near');
      else {
        createUserInDBAndSendMail(req.user._json);
        res.redirect('/near');
      }
    });
  }
});

app.get('/near', ensureAuthenticated, function(req, res){
  apiAccessToken = Math.random().toString(36).substring(7);
  res.render('near', { user: req.user, success: false, apiAccessToken: apiAccessToken });
});

app.get('/upload', ensureAuthenticated, function(req, res){
  res.render('upload', { user: req.user });
});

app.get('/dash', ensureAuthenticated, function(req, res){
  apiAccessToken = Math.random().toString(36).substring(7);
  res.render('dash', { user: req.user, success: false, apiAccessToken: apiAccessToken });
});

app.post('/deleteFile/:accessToken', ensureAuthenticated, function(req, res) {
  if (req.params.accessToken == apiAccessToken) {
    File.remove({ _id: req.body.fileId }, function (err) {
      if (err)
        console.log(err);
      else {
        res.redirect('/dash');
      }
    });
  } else {
    console.log('Invalid access token');
  }
});

app.post('/upload', ensureAuthenticated, function(req, res) {
  var newFile = new File(req.body);
  newFile.save(function(err) { 
    if (err) 
      console.log(err); 
    else {
      res.redirect('/near');
    }
  });
});

// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook',
  passport.authenticate('facebook'),
  function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  });

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// API METHODS

// GET lat and long
// return files within 1 kilometer ~(0.009 degrees) (open access API, think of security later especially with writing to db apis) 
// Add access token parameters
app.get('/files/:lat/:lng/:accessToken', ensureAuthenticated, function(req, res) {
  if (req.params.accessToken == apiAccessToken) {
    // if cannot parse or error 
    // res.json { error: Internal server error || invalid parameters (make sure they are integers and within the scope of worldwide lat and long) }
    var query = File.find();
    var resultsArr = [];
    var radius = 0.009;
    query.exec(function (err, docs) {
      if (err)
        console.log(err);
      else {
        for (var i = 0; i < docs.length; i++) {
          var split = docs[i].latlng.split(',');
          split[0] = parseFloat(split[0], 10);
          split[1] = parseFloat(split[1], 10);
          if (Math.pow(split[0] - req.params.lat, 2) + Math.pow(split[1] - req.params.lng, 2) < Math.pow(radius, 2)) {
            resultsArr.push(docs[i]);
          }
        }
      }
      res.json(resultsArr);
    });
  } else {
    res.json({ error: "Invalid access token. Note: Some men (and women) just want to watch the world burn. Don't be one of them." });
  }
  // Processing logic
});

app.get('/user/uploads', ensureAuthenticated, function(req, res) {
  var query = File.find({ authorId: req.user.id });
  query.exec(function (err, docs) {
    if (err)
      console.log(err);
    else {
      res.json(docs);
    }
  });
});

// WE NEED A 404

app.listen(3000);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}

function createUserInDBAndSendMail(user) {
  // Send User Email
  var path           = require('path')
    , templatesDir   = path.resolve(__dirname, 'templates')
    , emailTemplates = require('email-templates')
    , nodemailer     = require('nodemailer');

  emailTemplates(templatesDir, function(err, template) {

    if (err) {
      console.log(err);
    } else {

      // ## Send a single email
      user.provider = "facebook";
      var newUser = new User(user);
      newUser.save(function(err) { if (err) console.log(err); });

      // Prepare nodemailer transport object
      var transport = nodemailer.createTransport("SMTP", {
        service: "Gmail",
        auth: {
          user: "teamairclipp@gmail.com",
          pass: "haha1234"
        }
      });

      // An example users object with formatted email function
      var locals = {
        email: user.email,
        name: user.name
      };

      // Send a single email
      template('welcome', locals, function(err, html, text) {
        if (err) {
          console.log(err);
        } else {
          transport.sendMail({
            from: 'Team Airclipp <welcome@airclipp.com>',
            to: locals.email,
            subject: 'Welcome to Airclipp',
            html: html,
            // generateTextFromHTML: true,
            text: text
          }, function(err, responseStatus) {
            if (err) {
              console.log(err);
            } else {
              console.log(responseStatus.message);
            }
          });
        }
      });

    }

  });
}
