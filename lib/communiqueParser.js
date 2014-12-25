var htmlparser = require('htmlparser2');
var util       = require('util');
var Parser     = require('./parser');

var app = exports = module.exports = CommuniqueParser;

function CommuniqueParser () {

    this.padList = [];

    this.dateTag       = 0;
    this.urlTag        = 0;
    this.contentTag    = 0;
    this.urlSearchTag  = 0;
    this.commentTag    = 0;
    this.itemID        = 0;
    this.yearTag       = 0;
    this.communiqueTag = 0;
    this.iniTag        = 0;
    this.contentEnTag  = 0;

    this.url     = {name: '', url: ''};
    this.urls    = [];
    this.tags    = [];
    this.comment = [];
    this.item    = {date: '', padID: '', tags: this.tags, content: '', content_en: '', comment: this.comment, urls: this.urls};
    this.date    = '';
    this.year    = '';
};

util.inherits(CommuniqueParser, Parser);

CommuniqueParser.prototype.runParser = function (padID, result) {

    this.dateTag       = 0;
    this.urlTag        = 0;
    this.contentTag    = 0;
    this.urlSearchTag  = 0;
    this.commentTag    = 0;
    this.itemID        = 0;
    this.yearTag       = 0;
    this.communiqueTag = 0;
    this.iniTag        = 0;
    this.contentEnTag  = 0;
    this.parseCheck    = 0;

    this.url     = {name: '', url: ''};
    this.urls    = [];
    this.tags    = [];
    this.comment = [];
    this.item    = {date: '', padID: padID, tags: this.tags, content: '', content_en: '', comment: this.comment, urls: this.urls};
    this.date    = '';
    this.year    = '';

    var communiqueParser = this;

    parser = new htmlparser.Parser({
        onopentag: function (name, attribs) {
            // console.log("opentag " + name);
            switch (name)
            {
                case 'p':
                    communiqueParser.dateTag == 0 ? communiqueParser.dateTag++:communiqueParser.dateTag;
                    break;
                case 'b':
                    communiqueParser.dateTag == 1 ? communiqueParser.dateTag++:communiqueParser.dateTag;
                    break;
                case 'a':
                    communiqueParser.urlTag++;
                    communiqueParser.url  = {name: '', url: ''};
                    communiqueParser.url['url'] = attribs['href'][0] == '/' ? 'http://g0v.hackpad.com' + attribs['href'] : attribs['href'];
                    // console.log(communiqueParser.url['url']);
                    break;
                case 'ul':
                    communiqueParser.contentTag == 0 ? communiqueParser.contentTag++:communiqueParser.contentTag;
                    // console.log(attribs['class']);
                    attribs['class'] == 'comment' ? communiqueParser.commentTag++:communiqueParser.commentTag;
                    break;
                case 'li':
                    if (communiqueParser.contentTag == 1 && communiqueParser.commentTag == 0)
                    {
                        // communiqueParser.urls = [];
                        // communiqueParser.tags = [];
                        // communiqueParser.comment = [];
                        // communiqueParser.item = {date: '',padID: padID, tags: communiqueParser.tags, content: '', content_en: '', comment: communiqueParser.comment, urls: communiqueParser.urls};
                        communiqueParser.contentTag++;
                    }
                    else if (communiqueParser.commentTag > 0)
                    {
                        communiqueParser.commentTag++;
                        communiqueParser.comment[communiqueParser.commentTag - 2] = '';
                    }
                    break;
                case 'h1':
                    communiqueParser.yearTag++;
                    communiqueParser.parseCheck = 1;
                    break;
                default:
                    break;
            }
            // console.log("opentag " + name + communiqueParser.dateTag);
        },
        ontext: function (text) {
            text = text.replace(/&nbsp;/g, '');
            text = text.replace(/&quot;/g, '\"');
            text = text.replace(/&#92;/g, '\\');
            text = text.replace(/\n/g, '');

            if (communiqueParser.parseCheck == 0) {
                return;
            }

            // console.log("text " + text);

            if (text.substring(0, 4).match('[EN]'))
            {
                text = text.substring(5);
                // console.log('EN Get!!!!!');
                communiqueParser.contentEnTag = 1;
            }
            else if (communiqueParser.contentTag == 2 && communiqueParser.commentTag == 0 && communiqueParser.iniTag != 1 && communiqueParser.contentEnTag != 1)
            {
                communiqueParser.urls = [];
                communiqueParser.tags = [];
                communiqueParser.comment = [];
                communiqueParser.item = {date: '',padID: padID, tags: communiqueParser.tags, content: '', content_en: '', comment: communiqueParser.comment, urls: communiqueParser.urls};
                communiqueParser.iniTag = 1;
            }

            if (communiqueParser.yearTag > 0)                                        // parse communiqueParser.Year and check communique
            {
                communiqueParser.emit('updateHackpadListTitle', padID, text);
                text = text.replace(/ /g, '');
                if (text.match(/\d{4}\/\d{2}\/\d{2}~\d{2}\/\d{2}公報/))
                {
                    communiqueParser.year = text.substring(0, 4);
                    console.log("year: " + communiqueParser.year);
                    communiqueParser.communiqueTag = 1;
                    var padExist = 0;
                    var tmpPad = {};
                    for (var i = communiqueParser.padList.length - 1; i >= 0; i--) {
                        tmpPad = communiqueParser.padList[i];
                        if (tmpPad['ID'] == padID) {
                            padExist = 1;
                            communiqueParser.emit('removeCommuniqueData', padID);
                        }
                    }
                    if (padExist == 0) {
                        tmpPad['ID'] = padID;
                        tmpPad['ver.'] = 0;
                        communiqueParser.padList.push(tmpPad);
                        // console.log ('add pad: ID ' + tmpPad['ID'] + ' ver. ' + tmpPad['ver.']);
                    }

                    communiqueParser.parseCheck = 2;
                }
                else
                {
                    communiqueParser.parseCheck = 0;
                    return 0;
                }
            }

            if (communiqueParser.dateTag == 2 && text.match(/\d{2}\/\d{2}/) && communiqueParser.communiqueTag > 0)         // parse communiqueParser.date
            {
                // console.log("match communiqueParser.date", text);
                communiqueParser.date = communiqueParser.year + "\/" + text;
            }
            else if (communiqueParser.contentTag > 0 && communiqueParser.date != '' && communiqueParser.communiqueTag > 0)                  // parse content
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
                        communiqueParser.urlSearchTag = 1;
                    }
                    for (var i = tagList.length - 1; i >= 0; i--) { // replace space
                        tagList[i] = tagList[i].replace(/ /g, '');
                    };
                    // console.log("tagList: ", tagList);
                    communiqueParser.tags = communiqueParser.tags.concat(tagList);
                    communiqueParser.item['tags'] = communiqueParser.tags;
                    // console.log("add Tag 1: " + communiqueParser.tags);
                }

                // if (communiqueParser.contentEnTag == 1)
                // {
                //     communiqueParser.item['content_en'] += text;
                //     console.log('content_en 1' + communiqueParser.item['content_en']);
                // }
                // else
                // {
                //     communiqueParser.item['content'] += text;
                //     console.log(communiqueParser.item['content']);
                // }
                if(communiqueParser.urlTag > 0)                                      // parse url
                {
                    if (communiqueParser.urlSearchTag != 1)
                    {

                        if (communiqueParser.commentTag > 0)                         // parse comment
                        {
                            // console.log('commentText' + text);
                            communiqueParser.comment[communiqueParser.commentTag - 2] += text;
                        }
                        else
                        {
                            if (communiqueParser.contentEnTag == 1)
                            {
                                communiqueParser.item['content_en'] += text;
                                // console.log('content_en 2' + communiqueParser.item['content_en']);
                            }
                            else
                            {
                                communiqueParser.item['content'] += text;
                            }
                        }

                        if (text != '')                             // parse <a href=xxx>#Tag</a>
                        {
                            communiqueParser.url['name'] = text;
                            communiqueParser.urls.push(communiqueParser.url);
                        }
                        // console.log(communiqueParser.url['name']);
                    }
                    else
                    {
                        communiqueParser.urlSearchTag = 0;
                        text = text.replace(/ /g, '');
                        communiqueParser.tags.push(text);
                        // console.log("add Tag 2: " + communiqueParser.tags);
                    }
                }
                else
                {
                    if (communiqueParser.commentTag > 0)
                    {
                        // console.log('commentText' + text);
                        communiqueParser.comment[communiqueParser.commentTag - 2] += text;
                    }
                    else
                    {
                        if (communiqueParser.contentEnTag == 1)
                        {
                            communiqueParser.item['content_en'] += text;
                            // console.log('content_en 3' + communiqueParser.item['content_en']);
                        }
                        else
                        {
                            communiqueParser.item['content'] += text;
                        }
                    }
                }
            }
        },
        onclosetag: function (tagname) {
            // console.log("closetag " + tagname);
            switch (tagname)
            {
                case 'p':
                    communiqueParser.dateTag == 1 ? communiqueParser.dateTag--:communiqueParser.dateTag;
                    break;
                case 'b':
                    communiqueParser.dateTag == 2 ? communiqueParser.dateTag--:communiqueParser.dateTag;
                    break;
                case 'a':
                    communiqueParser.urlTag--;
                    break;
                case 'ul':
                    communiqueParser.contentTag == 1 ? communiqueParser.contentTag--:communiqueParser.contentTag;
                    if (communiqueParser.commentTag > 0)
                    {
                        // communiqueParser.item['comment'] = communiqueParser.comment;
                        communiqueParser.emit('updateCommuniqueData', {_id: communiqueParser.itemID}, {comment: communiqueParser.comment});
                        communiqueParser.commentTag = 0;
                    }
                    break;
                case 'li':
                    if (communiqueParser.contentTag == 2 && communiqueParser.contentEnTag == 0)
                    {
                        communiqueParser.item['date'] = communiqueParser.date;
                        // console.log(communiqueParser.item);
                        if (communiqueParser.date != '') {
                            communiqueParser.emit('insertCommuniqueData', communiqueParser.item, function (ID) {
                                communiqueParser.itemID = ID;
                                // console.log('ID' + communiqueParser.itemID);
                            });
                        }
                        communiqueParser.contentTag--;
                        communiqueParser.iniTag = 0;
                    }
                    else if (communiqueParser.contentEnTag == 1)
                    {
                        communiqueParser.emit('updateCommuniqueData', {_id: communiqueParser.itemID}, {content_en: communiqueParser.content_en});
                        communiqueParser.contentEnTag = 0;
                    }
                    break;
                case 'h1':
                    communiqueParser.yearTag--;
                default:
                    break;
            }
            // console.log("closetag " + tagname+communiqueParser.dateTag);
        }
    });
    parser.write(result);

    parser.end();
    communiqueParser.emit('endOfParser');
};
