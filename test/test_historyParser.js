var Hackpad       = require('hackpad');
var HistoryParser = require('../lib/historyParser');
var config        = require('../lib/config');
var should        = require('should');

describe('history Parser', function () {
    this.timeout(5000);

    it('should have correct keys and content', function (done) {

        var historyParser = new HistoryParser();
        var hackpadClient = new Hackpad(config.hackpad.client, config.hackpad.secret, config.hackpad);

        hackpadClient.revisions('i8tMqWAFi39', function (err,result) {
            if (err) {
                it('should not be error', function () {
                    err.should.not.be.an.Error;
                });
            } else {
                historyParser.runParser('i8tMqWAFi39', result);
            }
        });

        historyParser.on('insertHackpadHistory', function (padHistory) {
            padHistory.should.have.keys(['padID', 'history', 'editNum', 'authors', 'authorsNum', 'createTimeStamp']);
            padHistory.padID.should.be.equal('i8tMqWAFi39');
        });

        historyParser.on('insertHackpadData', function (data) {
            data.should.have.keys(['date', 'num']);
        });

        historyParser.on('insertHackpadAuthors', function (author) {
            author.should.have.keys(['name', 'editNum', 'pads']);
            author.pads.should.containEql('i8tMqWAFi39');
        });

        historyParser.on('endOfParser', function () {
            done();
        });
    });
});
