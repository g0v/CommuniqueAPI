var Hackpad          = require('hackpad');
var config           = require('./config');
var CommuniqueParser = require('./communiqueParser');
var TagParser        = require('./tagParser');
var HistoryParser    = require('./historyParser');

var app = exports = module.exports = {};

var hackpadClient     = {};
var dbClient          = {};
var initDate          = new Date();
var communiqueParser  = new CommuniqueParser();
var tagParser         = new TagParser();
var historyParser     = new HistoryParser();
var historyUpdateTime = 12;

app.init = function(db){
    hackpadClient = new Hackpad(config.hackpad.client, config.hackpad.secret, config.hackpad);
    dbClient = db;
    historyUpdateTime = 12;

    hackpadClient.list(function (err, result) {
        if(err) {
            console.log('List hackpad Error:' + err);
        } else {
            console.log(result);
            dbClient.insertHackpadList(result);

            parseCommunique(result, 1);
            parsePadHistory(result, 1);
        }
    });
};

/**
 * Get the communique from hackpad by hackpad api.
 */
app.run = function (){
    hackpadClient.editedSince(parseInt(initDate.getTime() / 1000), function (err, getPadList) {

        initDate = new Date();
        initDate -= 1000 * 60 * 60;     // Get The updated site one hour ago.
        console.log('Today: ' + initDate);
        if (getPadList == '' || typeof(getPadList) == 'undefined') {
            console.log("Pad List is NULL");
            getPadList = [];
        } else {
            console.log ("Get Pad List: " + getPadList);
        }
        parseCommunique(getPadList, 1);
    });

    hackpadClient.export('Fe3VpeN42w9', 'latest', 'html', function (err, result) {
        console.log('Fe3VpeN42w9');
        if(err) {
            console.log(err);
        } else {
            tagParser.runParser(result);
        }
    });

    if (historyUpdateTime === 0) {

        historyUpdateTime = 12;

        dbClient.clearHackpadHistory();
        dbClient.clearHackpadData();
        dbClient.cleaHackpadAuthors();

        hackpadClient.list(function (err, result) {
            if(err) {
                console.log('List hackpad Error:' + err);
            } else {
                parsePadHistory(result, 1);
            }
        });
    } else {
        historyUpdateTime--;
    }
};

function parseCommunique (padList, i) {
    if ((i - 1) < padList.length) {
        hackpadClient.export(padList[i - 1], 'latest', 'html', function (err, result) {
            if (err) {
                console.log(padList[i - 1] + ' error: ' + err);
            } else {
                communiqueParser.runParser(padList[i - 1], result);
                parseCommunique(padList, 2 * i);
                parseCommunique(padList, 2 * i + 1);
            }
        });
    } else {
        console.log('Parse Communique done.');
    }
};

function parsePadHistory (padList, i) {
        if ((i - 1) < padList.length) {
        hackpadClient.revisions(padList[i - 1], function (err, result) {
            if (err) {
                console.log(padList[i - 1] + ' error: ' + err);
            } else {
                if (result instanceof Array) {
                    historyParser.runParser(padList[i - 1], result);
                }
                parsePadHistory(padList, 2 * i);
                parsePadHistory(padList, 2 * i + 1);
            }
        });
    } else {
        console.log('Parse History done.');
    }
}

communiqueParser.on('removeCommuniqueData', function (padID) {
    dbClient.removeData(padID);
});

communiqueParser.on('updateCommuniqueData', function (id, data) {
    dbClient.updateData(id, data);
});

communiqueParser.on('insertCommuniqueData', function (data, getItemID) {
    dbClient.insertData(data, getItemID);
});

communiqueParser.on('updateHackpadListTitle', function (padID, text) {
    dbClient.updateHackpadListTitle(padID, text);
});

tagParser.on('updateTag', function (result) {
    dbClient.updateTags(result);
});

historyParser.on('insertHackpadHistory', function (padHistory) {
    dbClient.insertHackpadHistory(padHistory);
});

historyParser.on('insertHackpadData', function (data) {
    dbClient.insertHackpadData(data);
});

historyParser.on('insertHackpadAuthors', function (author) {
    dbClient.insertHackpadAuthors(author);
});
