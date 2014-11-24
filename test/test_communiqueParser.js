var Hackpad          = require('hackpad');
var CommuniqueParser = require('../lib/communiqueParser');
var config           = require('../lib/config');
var should           = require('should');

describe('Communique Parser', function () {
    this.timeout(5000);

    it('should have correct keys and content', function (done) {

        var communiqueParser = new CommuniqueParser();
        var hackpadClient    = new Hackpad(config.hackpad.client, config.hackpad.secret, config.hackpad);

        hackpadClient.export('gliZZuXU5aW', "latest", "html", function (err, result) {
            if(err) {
                it('should not be error', function () {
                    err.should.not.be.an.Error;
                });
            } else {
                communiqueParser.runParser('gliZZuXU5aW', result);
            }
        });

        communiqueParser.on('removeCommuniqueData', function (padID) {
            padID.should.be.equal('gliZZuXU5aW');
        });

        communiqueParser.on('updateCommuniqueData', function (id, data) {
            data.should.be.an.Object;
        });

        communiqueParser.on('insertCommuniqueData', function (data, getItemID) {
            data.should.have.keys(['date', 'padID', 'tags', 'content', 'content_en', 'comment', 'urls']);
            data.padID.should.be.equal('gliZZuXU5aW');
            getItemID.should.be.an.Function;
        });

        communiqueParser.on('updateHackpadListTitle', function (padID, text) {
            padID.should.be.equal('gliZZuXU5aW');
        });

        communiqueParser.on('endOfParser', function () {
            done();
        });
    });
});
