var config     = require('./config');
var fs         = require('fs');
var Hackpad    = require('hackpad');
var htmlparser = require('htmlparser2');
var dbClient   = require('./db');

var app = exports = module.exports = {};

var hackpadClient;

app.init = function(){
    hackpadClient = new Hackpad(config.hackpad.client, config.hackpad.secret, config.hackpad);
    dbClient.init();
};


function runParser(result){

    var tagTag     = 0;
    var urlTag     = 0;
    var contentTag = 0;
    var newline    = 0;

    var url = {name: '', url: ''};
    var urls = [];
    var tag = {name: '', description: '', urls: urls};

    parser = new htmlparser.Parser({
        onopentag: function (name, attribs) {
            // console.log('opentag ' + name);
            switch (name)
            {
                case 'p':
                    contentTag++;
                    newline++;
                    break;
                case 'a':
                    urlTag++;
                    url  = {name: '', url: ''};
                    url['url'] = attribs['href'];
                    // console.log(url['url']);
                    break;
                case 'h2':
                    if (tagTag == 0) {
                        tagTag++;
                        url = {name: '', url: ''};
                        urls = [];
                        tag = {name: '', description: '', urls: urls};
                    }
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
            // console.log('text ' + text);

            if (tagTag == 1) {
                // console.log('tag: ' + text);
                tag['name'] = text;
                dbClient.updateTags(tag);
            }
            else if (urlTag == 1) {
                url['name'] = text;
                urls.push(url);
            }

            if (contentTag > 0) {
                if (newline == 1) {
                    tag['description'] += tag['description'] == '' ? '':'\n';
                }
                newline = 0;
                tag['description'] += text;
            }
        },
        onclosetag: function (tagname) {
            // console.log('closetag ' + tagname);
            switch (tagname)
            {
                case 'p':
                    contentTag--;
                    break;
                case 'a':
                    urlTag--;
                    break;
                case 'h2':
                    tagTag--;
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


/**
 * Get the communique from hackpad by hackpad api.
 */
app.run = function(){
    hackpadClient.export('Fe3VpeN42w9', 'latest', 'html', function (err, result) {
        // console.log('Fe3VpeN42w9');
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
            runParser(result);
        }
    });
};
