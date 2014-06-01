var fs               = require('fs');
var Hackpad          = require('hackpad');
var htmlparser       = require('htmlparser2');
var config           = require('./config');
var CommuniqueParser = require('./communiqueParser');
var TagParser        = require('./tagParser');

var app = exports = module.exports = {};

var hackpadClient    = {};
var dbClient         = {};
var initDate         = new Date(2013, 9, 1);
var communiqueParser = new CommuniqueParser();
var tagParser        = new TagParser();

app.init = function(db){
    hackpadClient = new Hackpad(config.hackpad.client, config.hackpad.secret, config.hackpad);
    // this.defaultConfig();
    dbClient = db;
};

/**
 * Get the communique from hackpad by hackpad api.
 */
app.run = function (){
    hackpadClient.editedSince(parseInt(initDate.getTime() / 1000), function (err, getPadList) {

        initDate = new Date();
        initDate -= 1000 * 60 * 60;     // Get The updated site one hour ago.
        console.log('Today: ' + initDate);
        if (getPadList == '' || typeof(getPadList) == 'undefined')
        {
            console.log("Pad List is NULL");
            getPadList = [];
        }
        else
        {
            console.log ("Get Pad List: " + getPadList);
        }

        getPadList.forEach(function (ID) {
            hackpadClient.export(ID, "latest", "html", function (err, result) {
                console.log(ID);
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    // fs.writeFile(ID + '.html', result, 'utf-8', function(err){
                    //     if (err)
                    //     {
                    //         console.log(err);
                    //     }
                    // });
                    communiqueParser.runParser(ID, result);
                }
            });
        });
    });

    hackpadClient.export('Fe3VpeN42w9', 'latest', 'html', function (err, result) {
        console.log('Fe3VpeN42w9');
        if(err)
        {
            console.log(err);
        }
        else
        {
            // fs.writeFile('Fe3VpeN42w9.html', result, 'utf-8', function(err){
            //     if (err)
            //     {
            //         console.log(err);
            //     }
            // });
            tagParser.runParser(result);
        }
    });
};

communiqueParser.on('removeCommuniqueData', function (padID) {
    dbClient.removeData(padID);
});

communiqueParser.on('updateCommuniqueData', function (id, data) {
    dbClient.updateData(id, data);
});

communiqueParser.on('insertCommuniqueData', function (data, getItemID) {
    dbClient.insertData(data, getItemID);
});

tagParser.on('updateTag', function (result) {
    dbClient.updateTags(result);
});
