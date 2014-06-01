var events     = require('events');
var util       = require('util');

var app = exports = module.exports = Parser;

function Parser () {

};

util.inherits(Parser, events.EventEmitter);
