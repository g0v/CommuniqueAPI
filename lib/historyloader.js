var Hackpad = require('hackpad');
var config = require('./config');


var hackpadHistory = [];

app.init = function(){
    hackpadClient = new Hackpad(config.hackpad.client, config.hackpad.secret, config.hackpad);
};

app.run = function(){
    hackpadClient.list(function (err, result) {
        if(err) {
            console.log(err);
        } else {
            console.log(result);

            result.forEach(function (padID) {
                var hackpadHistoryEntry = {
                    padID: padID,
                    history: [],
                }
                hackpadClient.revisions(padID, function(err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(result);
                        hackpadHistoryEntry['history'] = result;
                        hackpadHistory.push(hackpadHistoryEntry);
                    }
                });
            })
        }
    });
};
