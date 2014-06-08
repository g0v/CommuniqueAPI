var Hackpad   = require('hackpad');
var TagParser = require('../lib/tagParser');
var config    = require('../lib/config');
var should    = require('should');

describe('Tag Parser', function () {
    this.timeout(5000);

    it('should have correct keys and content', function (done) {
        var tagParser = new TagParser();
        var hackpadClient = new Hackpad(config.hackpad.client, config.hackpad.secret, config.hackpad);

        hackpadClient.export('Fe3VpeN42w9', 'latest', 'html', function (err, result) {
            if (err) {
                it('should not be error', function () {
                    err.should.not.be.an.Error;
                });
            } else {
                tagParser.runParser(result);
            }
        });

        tagParser.on('updateTag', function (result) {
            result.should.have.keys(['name', 'description', 'urls']);
        });

        tagParser.on('endOfParser', function () {
            done();
        });
    });
});
