// DEPENDENCIES
// ============
// check out npmjs.org to see what each module does
var express         = require('express');
var flash           = require('connect-flash');
var passport        = require('passport');
var mongoose        = require('mongoose');
var LocalStrategy   = require('passport-local').Strategy;
var logger          = require('morgan');
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var servestatic     = require('serve-static');
var errorhandler    = require('errorhandler');
var session         = require('express-session');
var cookieParser    = require('cookie-parser');
var favicon         = require('serve-favicon');

// CREATE EXPRESS SERVER
// =====================
var app = express();

// SERVER CONFIG
// =============
// we can set local.settings variables which will be available in any views
// for example the following title will be available as settings.title
// in any views
app.set('title', 'Login Test');
// set our port
app.set('port', process.env.PORT || 3001);
// set server mode
app.set('env',  process.env.NODE_ENV || 'development');
// use the EJS template engine and the location of the views
app.set('views', __dirname + '/app/views');
app.set('view engine', 'ejs');

// MIDDLEWARE CONFIG
// =================
// the favicon to use
app.use(favicon(__dirname + '/site/favicon.ico'));
// logs all requests and methods - should use a different logger in production
app.use(logger('dev'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// we use methodOverride to fake PUT and DELETE methods from html forms
app.use(methodOverride('_method'));
// we need this for the session cookie
app.use(cookieParser());
// configure session
app.use(session({
  secret: 'secret',								// passport requires secret sessions
  cookie: {
    maxAge: 600000								// 10 minutes
  },
  saveUninitialized: true,
  resave: true
}));
// session flash message support
app.use(flash());
// Initialize Passport!  
// Use passport.session() middleware, to support persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

// where to serve static files from
app.use(servestatic(__dirname + '/site'));
// only dump exceptions and show stack in development env
if ('development' == app.settings.env) {
  console.log('!! Dumping Exceptions and Showing Stacktrace');
  app.use( errorhandler({ dumpExceptions: true, showStack: true }));
}

// MODEL
// =====
// the accounts model used by passport and to seed a user
var Account = require('./app/models/account');

// PASSPORT
// ========
// authentication setup
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// DATABASE 
// ========
// Connection via mongoose
// database connection config in separate file (defaults should be updated)
var database = require('./config/database');
mongoose.connect(database.url);

// SEED ADMIN USER
// ===============
// Create an initial admin account if there are no accounts in development
// this is executed once at startup of server
// Fetch username and password from separate config file (defaults should be updated)
var seed = require('./config/seed');
Account.find( {"username":"admin"}, function( err, accounts ) {
  if (!accounts.length) {
    Account.register(new Account({ username : seed.username, role : "admin" }), seed.password, function(err, account) {
      if (!err) {
        console.log("no accounts found - created admin account");
      } else {
        console.log("no account found - error creating admin account: " + err);
      }
    });
  } else {
    console.log("Admin account found...");
  }
});

// REGISTER ROUTES 
// ===============
require('./app/routes')(app);

// START SERVER
// ============
app.listen(app.get('port'), function() {
  console.log( 'listening on port %d in %s mode', app.get('port'), app.get('env') );
});
