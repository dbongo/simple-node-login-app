var should = require("should");
var mongoose = require('mongoose');
var Account = require("../app/models/account.js");
var db;

describe('Account: Admin Users', function() {

before(function(done) {
 db = mongoose.connect('mongodb://localhost/test');
   done();
 });

 after(function(done) {
   mongoose.connection.close();
   done();
 });

 beforeEach(function(done) {
  var account = new Account({
    username: 'admin',
    password: 'testy',
    role: 'admin'
  });

  account.save(function(error) {
    if (error) console.log('error' + error.message);
    else console.log('no error');
    done();
   });
 });

 it('find a user by username', function(done) {
    Account.findOne({ username: 'admin' }, function(err, account) {
      account.username.should.eql('admin');
      console.log("   username: ", account.username);
      done();
    });
 });

 it('check default role is user', function(done) {
    Account.findOne({ username: 'admin' }, function(err, account) {
      account.role.should.eql('admin');
      console.log("   role: ", account.role);
      done();
    });
 });

 it('test login', function(done) {
    Account.findOne({ username: 'admin' }, function(err, account) {
      account.role.should.eql('admin');
      console.log("   role: ", account.role);
      done();
    });
 });

 afterEach(function(done) {
    Account.remove({}, function() {
      done();
    });
 });

});