var Hackpad = require('hackpad');
var config = require('./config');

var app = exports = module.exports = {};

var hackpadHistory = [];
var hackpadData = [];
var hackpadList = [];

app.init = function(){
    hackpadClient = new Hackpad(config.hackpad.client, config.hackpad.secret, config.hackpad);
};

app.run = function(){
    hackpadClient.list(function (err, result) {
        if(err) {
            console.log(err);
        } else {
            console.log(result);
            hackpadList = result;
            result.forEach(function (padID) {
                // var padID = "1xcAfdHtkv0;"
                var hackpadHistoryEntry = {
                    padID: padID,
                    history: [],
                    editNum: 0,
                    createTimeStamp: ''
                };
                hackpadClient.revisions(padID, function(err, result) {
                    if (err) {
                        console.log("ID: " + padID + " error:" + err);
                    } else {
                        // console.log(result);
                        hackpadHistoryEntry['history'] = result;
                        hackpadHistoryEntry['editNum'] = result[0].endRev;
                        hackpadHistoryEntry['createTimeStamp'] = result[result.length - 1].timestamp;
                        // console.log(result[result.length - 1].timestamp);
                        storeHackpadData(result[result.length - 1].timestamp * 1000);
                        hackpadHistory.push(hackpadHistoryEntry);
                    }
                });
            })
        }
    });
};

app.getHackpadHistory = function () {
    return hackpadHistory;
};

app.getHackpadData = function () {
    return hackpadData;
};

app.getHackpadList = function() {
    return hackpadList;
};

storeHackpadData = function (timestamp) {
    var createDate = new Date(timestamp);
    var dataMonth = (createDate.getMonth() + 1) >= 10 ? (createDate.getMonth() + 1).toString() : '0' + (createDate.getMonth() + 1);
    var dataDate = createDate.getDate() >= 10 ? createDate.getDate().toString() : '0' + createDate.getDate();
    var dataCreateDate = createDate.getFullYear() + '-' + dataMonth + '-' + dataDate;
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
    }
};
