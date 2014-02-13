var config     = require('./config');
var fs         = require('fs');
var Hackpad    = require('hackpad');
var htmlparser = require('htmlparser2');
var dbClient   = require('./db');

var app = exports = module.exports = {};

var hackpadClient;

app.init = function(){
    hackpadClient = new Hackpad(config.hackpad.client, config.hackpad.secret, config.hackpad);
    // this.defaultConfig();
    dbClient.init();
};

function runParser (result) {
    parser = new htmlparser.Parser({
        onopentag: function (name, attribs) {
            console.log("opentag " + name);
            switch (name)
            {
                case 'p':
                    
                    break;
                case 'b':
                    
                    break;
                case 'a':
                    break;
                case 'ul':
                    
                    break;
                case 'li':
                    
                    break;
                default:
                    break;
            }
            // console.log("opentag " + name + dateTag);
        },
        ontext: function (text) {
            text = text.replace(/&nbsp;/g, '');
            text = text.replace(/&quot;/g, '\"');
            text = text.replace(/&#92;/g, '\\');
            console.log("text " + text);
        },
        onclosetag: function (tagname) {
            console.log("closetag " + tagname);
            switch (tagname)
            {
                case 'p':
                    
                    break;
                case 'b':
                    
                    break;
                case 'a':
                    break;
                case 'ul':
                    break;
                case 'li':
                    break;
                default:
                    break;
            }
            // console.log("closetag " + tagname+dateTag);
        }
    });
    parser.write(result);

    parser.end();
};

app.run = function(){
    hackpadClient.export('Fe3VpeN42w9', "latest", "html", function (err, result) {
        if (err) {
            console.log(err);
        } else {

            fs.writeFile('Fe3VpeN42w9.html', result, 'utf-8', function(err){
                if (err)
                {
                    console.log(err);
                }
            });
            runParser(result);
        }
    })
};
