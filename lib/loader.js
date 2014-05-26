var config     = require('./config');
var fs         = require('fs');
var Hackpad    = require('hackpad');
var htmlparser = require('htmlparser2');
var dbClient   = require('./db');

var app = exports = module.exports = {};

var hackpadClient;
var padList = [];
var initDate = new Date(2013, 9, 1);

app.init = function(){
    hackpadClient = new Hackpad(config.hackpad.client, config.hackpad.secret, config.hackpad);
    // this.defaultConfig();
    dbClient.init();
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
                    runParser(ID, result);
                }
            });
        });
    });
    // hackpadClient.export('BwdlpcRm2aU', 'latest', 'html', function (err, result) {
    //     console.log(result);
    //     runParser('BwdlpcRm2aU', result);
    // });
};

/**
 * Parse Communique's Html format.
 * @param  {String} year
 * @param  {String} padID
 * @param  {String} result
 */
function runParser (padID, result) {

    var dateTag       = 0;
    var urlTag        = 0;
    var contentTag    = 0;
    var urlSearchTag  = 0;
    var commentTag    = 0;
    var itemID        = 0;
    var yearTag       = 0;
    var communiqueTag = 0;

    var url     = {name: '', url: ''};
    var urls    = [];
    var tags    = [];
    var comment = [];
    var item    = {date: '',padID: padID,tags: tags, content: '', comment: comment, urls: urls};
    var date    = '';
    var year    = '';

    parser = new htmlparser.Parser({
        onopentag: function (name, attribs) {
            // console.log("opentag " + name);
            switch (name)
            {
                case 'p':
                    dateTag == 0 ? dateTag++:dateTag;
                    break;
                case 'b':
                    dateTag == 1 ? dateTag++:dateTag;
                    break;
                case 'a':
                    urlTag++;
                    url  = {name: '', url: ''};
                    url['url'] = attribs['href'];
                    // console.log(url['url']);
                    break;
                case 'ul':
                    contentTag == 0 ? contentTag++:contentTag;
                    // console.log(attribs['class']);
                    attribs['class'] == 'comment' ? commentTag++:commentTag;
                    break;
                case 'li':
                    if (contentTag == 1 && commentTag == 0)
                    {
                        urls = [];
                        tags = [];
                        comment = [];
                        item = {date: '',padID: padID,tags: tags, content: '', comment: comment, urls: urls};
                        contentTag++;
                    }
                    else if (commentTag > 0)
                    {
                        commentTag++;
                        comment[commentTag - 2] = '';
                    }
                    break;
                case 'h1':
                    yearTag++;
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
            // console.log("text " + text);

            if (yearTag > 0)                                        // parse Year and check communique
            {
                text = text.replace(/ /g, '');
                if (text.match(/\d{4}\/\d{2}\/\d{2}~\d{2}\/\d{2}公報/))
                {
                    year = text.substring(0, 4);
                    console.log("year: " + year);
                    communiqueTag = 1;
                    var padExist = 0;
                    var tmpPad = {};
                    for (var i = padList.length - 1; i >= 0; i--) {
                        tmpPad = padList[i];
                        if (tmpPad['ID'] == padID) {
                            padExist = 1;
                            dbClient.removeData(padID);
                        }
                    }
                    if (padExist == 0) {
                        tmpPad['ID'] = padID;
                        tmpPad['ver.'] = 0;
                        padList.push(tmpPad);
                        console.log ('add pad: ID ' + tmpPad['ID'] + ' ver. ' + tmpPad['ver.']);
                    };
                }
                else
                {
                    return 0;
                }
            }

            if (dateTag == 2 && text.match(/\d{2}\/\d{2}/) && communiqueTag > 0)         // parse date
            {
                // console.log("match date", text);
                date = year + "\/" + text;
            }
            else if (contentTag > 0 && date != '' && communiqueTag > 0)                  // parse content
            {
                // var textTmp;
                if (text.indexOf("#") >= 0)                         // parse Tag list
                {
                    var tmpList = text.split("#");
                    tagList = tmpList.splice(1);
                    text = tmpList[0];
                    if (tagList[tagList.length - 1] == '')          // parse #<a href=xxx>Tag</a>
                    {
                        tagList.pop();
                        urlSearchTag = 1;
                    }
                    for (var i = tagList.length - 1; i >= 0; i--) { // replace space
                        tagList[i] = tagList[i].replace(/ /g, '');
                    };
                    tags = tags.concat(tagList);
                    item['tags'] = tags;
                    // console.log("add Tag: " + tags);
                }
                // item['content'] += text;
                // console.log(item['content']);
                if(urlTag > 0)                                      // parse url
                {
                    if (urlSearchTag != 1)
                    {

                        if (commentTag > 0)                         // parse comment
                        {
                            // console.log('commentText' + text);
                            comment[commentTag - 2] += text;
                        }
                        else
                        {
                            item['content'] += text;
                        }

                        if (text != '')                             // parse <a href=xxx>#Tag</a>
                        {
                            url['name'] = text;
                            urls.push(url);
                        }
                        // console.log(url['name']);
                    }
                    else
                    {
                        urlSearchTag = 0;
                        text = text.replace(/ /g, '');
                        tags.push(text);
                    }
                }
                else
                {
                    if (commentTag > 0)
                    {
                        // console.log('commentText' + text);
                        comment[commentTag - 2] += text;
                    }
                    else
                    {
                        item['content'] += text;
                    }
                }
            }
        },
        onclosetag: function (tagname) {
            // console.log("closetag " + tagname);
            switch (tagname)
            {
                case 'p':
                    dateTag == 1 ? dateTag--:dateTag;
                    break;
                case 'b':
                    dateTag == 2 ? dateTag--:dateTag;
                    break;
                case 'a':
                    urlTag--;
                    break;
                case 'ul':
                    contentTag == 1 ? contentTag--:contentTag;
                    if (commentTag > 0)
                    {
                        // item['comment'] = comment;
                        dbClient.updateData({_id: itemID}, {comment:comment});
                        commentTag = 0;
                    }
                    break;
                case 'li':
                    if (contentTag == 2)
                    {
                        item['date'] = date;
                        // console.log(item);
                        if (date != '') {
                            dbClient.insertData(item, function (ID) {
                                itemID = ID;
                                // console.log('ID' + itemID);
                            });
                        }
                        contentTag--;
                    }
                    break;
                case 'h1':
                    yearTag--;
                default:
                    break;
            }
            // console.log("closetag " + tagname+dateTag);
        }
    });
    parser.write(result);

    parser.end();
};
