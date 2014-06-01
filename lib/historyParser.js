var util   = require('util');
var Parser = require('./parser');

var app = exports = module.exports = HistoryParser;

var hackpadAuthors = [];
var hackpadData = [];

function HistoryParser () {
    this.hackpadHistoryEntry = {
        padID: '',
        history: [],
        editNum: 0,
        createTimeStamp: ''
    };

    this.storeHackpadData = storeHackpadData;
    this.storeHackpadAuthors = storeHackpadAuthors;
};

util.inherits(HistoryParser, Parser);

HistoryParser.prototype.runParser = function (padID, result) {

    var historyParser = this;

    historyParser.hackpadHistoryEntry = {
        padID: '',
        history: [],
        editNum: 0,
        authors: [],
        authorsNum: 0,
        createTimeStamp: ''
    };

    historyParser.hackpadHistoryEntry['editNum'] = result[0].endRev;
    historyParser.hackpadHistoryEntry['createTimeStamp'] = result[result.length - 1].timestamp;
    historyParser.storeHackpadData(historyParser, result[result.length - 1].timestamp * 1000);
    if (result instanceof Array ) {
        result.forEach(function (value) {
            var authors = value.authors;
            var padAuthors = historyParser.hackpadHistoryEntry['authors'] || [];
            historyParser.hackpadHistoryEntry['authors'] = historyParser.storeHackpadAuthors(historyParser, authors, padID, padAuthors);
        });
    } else {
        console.log("history loader: not array: " + padID);
        historyParser.hackpadHistoryEntry['authors'] = [];

    }
    historyParser.hackpadHistoryEntry['authorsNum'] = historyParser.hackpadHistoryEntry['authors'].length;
    historyParser.emit('insertHackpadHistory', historyParser.hackpadHistoryEntry);

};

function storeHackpadData (historyParser, timestamp) {
    var createDate = new Date(timestamp);
    var dataMonth = (createDate.getMonth() + 1) >= 10 ? (createDate.getMonth() + 1).toString() : '0' + (createDate.getMonth() + 1);
    var dataDate = createDate.getDate() >= 10 ? createDate.getDate().toString() : '0' + createDate.getDate();
    var dataCreateDate = createDate.getFullYear() + dataMonth + dataDate;
    console.log(dataCreateDate);
    var check = 0;
    hackpadData.forEach(function (value) {
        if (value['date'] == dataCreateDate) {
            value['num']++;
            check = 1;
        }
    });
    if (check == 0) {
        var hackpadDataEntry = {
            date: dataCreateDate,
            num: 1
        }
        hackpadData.push(hackpadDataEntry);
        historyParser.emit('insertHackpadData', hackpadDataEntry);
    }
};

function storeHackpadAuthors (historyParser, authors, padID, padAuthors) {
    var check = 0;
    authors.forEach(function (person) {
        hackpadAuthors.forEach(function (value) {
            if (value['name'] == person) {
                value['editNum']++;
                if (!value['pads'].some(function (getID) { return getID == padID; })) {
                    value['pads'].push(padID);
                }
                check = 1;
            }
        });
        if (check == 0) {
            var hackpadAuthorsEntry = {
                name: person,
                editNum: 1,
                pads: [padID]
            };
            hackpadAuthors.push(hackpadAuthorsEntry);
            historyParser.emit('insertHackpadAuthors', hackpadAuthorsEntry);
        }
        if (!padAuthors.some(function (getAuthors) { return getAuthors == person})) {
            padAuthors.push(person);
        }
    });
    return padAuthors;
};
