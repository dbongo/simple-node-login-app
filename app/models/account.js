var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var roles = 'admin user'.split(' ');
var Account = new Schema({
    username: String,
    fullname: { type: String, default: '', required: false},
    initials: { type: String, default: '', required: false},
    password: String,
    role: { type: String, enum: roles, default: roles[roles.length-1] }
});

// set a couple of options for the passportLocalMongoose
// module so that incorrect usernames and passwords
// trigger a safer error message
Account.plugin(passportLocalMongoose, {
	incorrectUsernameError: 'Incorrect Username or Password',
	incorrectPasswordError: 'Incorrect Username or Password'
});

// method to help save users
Account.methods.saveUser = function(route, req, res) {
  this.save( function(err) {
    if( err ) {
      console.log( err );
      req.flash('error','User NOT Updated: ' + err);
      return res.redirect(route);
    } else {
      console.log( 'user updated' );
      req.flash('message','User Updated Successfully!');
      return res.redirect(route);
    }
  });
};

module.exports = mongoose.model('Account', Account);


