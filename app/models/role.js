var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roles = 'admin user'.split(' ');
var Role = new Schema({
    role: { type: String, enum: roles }
});

module.exports = mongoose.model('Role', Role);
