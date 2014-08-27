var passport = require('passport');
var Account = require('./models/account');
var Role = require('./models/role');
var ensurelogin = require('connect-ensure-login');
var ConnectRoles = require('connect-roles');

// connect Roles setup
var Roles = new ConnectRoles({
  failureHandler: function (req, res, action) {
    var accept = req.headers.accept || '';
    res.status(403);
    if (~accept.indexOf('html')) {
      res.render('access-denied', {action: action});
    } else {
      res.send('Access Denied - You don\'t have permission to: ' + action);
    }
  }
});

module.exports = function (app) {

  app.use(Roles.middleware());

  /*
  Roles.use(function (req, action) {
    if (!req.isAuthenticated()) return action === 'access index page';
  });
  */

  Roles.use('access private page', function (req) {
    if (req.user.role === 'user') {
      return true;
    }
  });

  Roles.use(function (req) {
    if (req.user.role === 'admin') {
      return true;
    }
  });

  // INDEX
  app.get('/', function (req, res) {
    res.render('index', { active : 'index', user : req.user, message : req.flash('message'), error : req.flash('error') });
  });

  // ABOUT
  app.get('/about', function (req, res) {
    res.render('about', { active : 'about' });
  });

  // LOGIN API
  // the login form
  app.get('/login', function(req, res) {
    res.render('index', { active : 'login', user : req.user, message : req.flash('error') });
  });

  // handle login via post
  app.post('/login',
    // successReturnToOrRedirect will pick up the returnTo URL from the
    // the session and redirect there after successful login
    passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/', failureFlash: true })
  );

  // handle logout
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  // USERS API
  // form to register and create a new user
  /*
  app.get('/register', Roles.can('access admin page'), function(req, res) {
    res.render('register', {
      loginaftercreate: true,
      user : req.user,
      message : req.flash('message')
    });
  });
  */

  // form to register and create a new user for admins to use
  // no login after create...
  app.get('/create', ensurelogin.ensureLoggedIn('/'), Roles.can('access admin page'),
    function(req, res) {
      res.render('create', {
        active : 'create',
        loginaftercreate: false,
        user : req.user,
        message : req.flash('message')
      });
  });

  // list existing users. 
  // Should only be available to admins
  app.get('/users', ensurelogin.ensureLoggedIn('/'), Roles.can('access admin page'),
    function(req, res) {
      // example of chaining query as per jquery
      Account
        .find({})
        .sort('username')
        .exec( function(err, users) {
          if (err) {
            return console.log( err );
          }
          res.render('list', {
            active : 'list',
            users: users,
            user: req.user,
            message : req.flash('message'),
            error : req.flash('error')
          });
        });
    }
  );

  // create a new user
  // Should only be available to admins
  app.post('/users', ensurelogin.ensureLoggedIn('/'), Roles.can('access admin page'), function(req, res) {
    if ('development' == app.settings.env) {
      console.log('username:', req.body.username, ', newpass:', req.body.password);
    }
    // always create only users - need to change role afterwards
    Account.register(new Account({ username : req.body.username, fullname : req.body.fullname, initials : req.body.initials }), req.body.password, function(err, account) {
      if (err) {
        req.flash('error', 'Error:' + err);
        return res.redirect(req.url);
      }
      if (req.body.loginaftercreate === 'false') {
        req.flash('message', 'New account created.');
        res.redirect('/users');
      } else {
        passport.authenticate('local')(req, res, function () {
          res.redirect('/');
        });
      }
    });
  });

  // display the form to allow user to change their own password
  app.get('/users/changepass', ensurelogin.ensureLoggedIn('/'), Roles.can('access private page'),
    function(req, res) {
      res.render('changepass', {
        active : 'changepass',
        user : req.user,
        message : req.flash('message'),
        error: req.flash('error') });
    }
  );

  // request change of own password 
  // HTML will use POST request with _method=PUT
  app.put('/users/changepass', ensurelogin.ensureLoggedIn('/'), Roles.can('access private page'),
    function(req, res) {
      if ('development' == app.settings.env) {
        console.log('oldpass: ['+req.body.oldpassword+'], newpass: ['+req.body.password.toString().trim()+']');
      }
      // test that old password is correct
      req.user.authenticate(req.body.oldpassword, function(err, isMatch) {
        if (err) {
          req.flash('message','Password Not Updated: Error occurred Checking old password');
          return res.redirect('/users/changepass');
        }
        if(isMatch) {
          req.user.setPassword(req.body.password, function (err) {
            if (err) {
              req.flash('message','Sorry, Something went wrong:' + err );
              return res.redirect('/users/changepass');
            } else {
              req.user.saveUser('/users/changepass', req, res);
            }
          });
        } else {
          req.flash('error','Password Not Updated: Existing password not correctly specified.');
          return res.redirect('/users/changepass');
        }
      });
    }
  );

  // get a single user for editing role and/or password by admin
  app.get('/users/:user_id', ensurelogin.ensureLoggedIn('/'), Roles.can('access admin page'),
    function(req, res) {
      Account.findById(req.params.user_id, function( err, User ) {
        if (!err) {
          // test whether we can allow editing of the Role
          // users cannot edit their own role.
          var caneditrole = (User._id.toString() !== req.user._id.toString());
          res.render('account', {
            active : 'account',
            canEditRole: caneditrole,
            roles : Account.schema.path('role').enumValues,
            user : User,
            message : req.flash('message'),
            error : req.flash('error')
          });
        } else {
          console.log( err );
          req.flash('message','User Account NOT found!' + err);
          return res.redirect('/users');
        }
      });
    }
  );

  // Admins can change any user details
  // HTML will use POST request with _method=PUT
  app.put('/users/:user_id', ensurelogin.ensureLoggedIn('/'), Roles.can('access admin page'),
    function(req, res) {
      Account.findById(req.params.user_id, function( err, User ) {
        if (!err) {
          if ('development' == app.settings.env) {
            console.log('newpass: ['+req.body.password.toString().trim()+"], role: ", req.body.role);
          }
          // users should not be able to change their own role
          // compare the logged in user (in req.user) with 
          // the user id in the route
          if (req.user._id.toString() !== req.params.user_id.toString()) {
            User.role = req.body.role;
            console.log( 'set user role' );
          }
          User.fullname = req.body.fullname;
          User.initials = req.body.initials;
          // if no password specified then do not update it
          if (req.body.password.trim() === '') {
            User.saveUser('/users', req, res);
          } else {
            // we do not check existing password in this case
            User.setPassword(req.body.password, function (err) {
              if (err) {
                req.flash('error','Sorry, Something went wrong:' + err );
                return res.redirect('/users/' + req.params.user_id);
              } else {
                console.log( 'set user password' );
                User.saveUser('/users', req, res);
              }
            });
          }
        } else {
          console.log( err );
          req.flash('error','Cannot find User Account - NOT updated!' + err);
          return res.redirect('/users');
        }
      });
    }
  );

  // Delete a user account
  // HTML will use POST request with _method=DELETE
  // there should be a confirmation dialog - how to do this?
  app.delete('/users/:user_id', ensurelogin.ensureLoggedIn('/'), Roles.can('access admin page'),
    function(req, res) {
      // logic to not delete own account
      if (req.params.user_id.toString() == req.user._id.toString()) {
        console.log('Cannot delete OWN user');
        req.flash('message','Cannot delete OWN User Account!');
        return res.redirect('/users');
      } else {
        console.log('Deleting user');
        Account.findById(req.params.user_id, function( err, User ) {
          if (!err) {
            return User.remove( function( err ) {
              if( !err ) {
                console.log( 'User removed' );
                req.flash('message','User Account Deleted!');
                res.redirect('/users');
              } else {
                console.log( err );
                req.flash('error','User Account NOT Deleted!' + err);
                return res.redirect('/users');
              }
            });
          } else {
            console.log( err );
            req.flash('error','User Account NOT Deleted!' + err);
            return res.redirect('/users');
          }
        });
      }
    }
  );

};