var dbClient = require('../lib/db');
var should   = require('should');

describe('hackpad list', function () {

    describe('#getHackpadList()', function (){
        it('should be the function', function () {
            dbClient.getHackpadList.should.be.an.Function;
        });
        it('should return the array', function () {
            dbClient.getHackpadList().should.be.an.Array;
        });
    });

    describe('#insertHackpadList("i8tMqWAFi39")', function () {

        it('should be the function', function () {
            dbClient.insertHackpadList.should.be.an.Function;
        });

        dbClient.insertHackpadList(['i8tMqWAFi39']);
        var getHackpadList = dbClient.getHackpadList();


        it('should increase hackpadList', function () {
            getHackpadList.length.should.equal(1);
        });

        it('padID should equal i8tMqWAFi39', function () {
            getHackpadList[0].padID.should.equal('i8tMqWAFi39');
        });
    });

    describe('#updateHackpadListTitle("i8tMqWAFi39", "test")', function () {
        it('should be the function', function () {
            dbClient.updateHackpadListTitle.should.be.an.Function;
        });

        dbClient.updateHackpadListTitle('i8tMqWAFi39', 'test');
        var getHackpadList = dbClient.getHackpadList();

        it('title should equal test', function () {
            getHackpadList[0].title.should.equal('test');
        });
    });
});
