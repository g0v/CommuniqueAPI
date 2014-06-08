var htmlparser = require('htmlparser2');
var util       = require('util');
var Parser     = require('./parser');

var app = exports = module.exports = TagParser;

function TagParser () {
    this.tagTag     = 0;
    this.urlTag     = 0;
    this.contentTag = 0;
    this.newline    = 0;

    this.url = {name: '', url: ''};
    this.urls = [];
    this.tag = {name: '', description: '', urls: this.urls};
}

util.inherits(TagParser, Parser);

TagParser.prototype.runParser = function (result){

    this.tagTag     = 0;
    this.urlTag     = 0;
    this.contentTag = 0;
    this.newline    = 0;

    this.url = {name: '', url: ''};
    this.urls = [];
    this.tag = {name: '', description: '', urls: this.urls};

    var tagParser = this;

    var parser = new htmlparser.Parser({
        onopentag: function (name, attribs) {
            // console.log('opentag ' + name);
            switch (name)
            {
                case 'p':
                    tagParser.contentTag++;
                    tagParser.newline++;
                    break;
                case 'a':
                    tagParser.urlTag++;
                    tagParser.url  = {name: '', url: ''};
                    tagParser.url['url'] = attribs['href'];
                    // console.log(tagParser.url['url']);
                    break;
                case 'h2':
                    if (tagParser.tagTag == 0) {
                        tagParser.tagTag++;
                        tagParser.url = {name: '', url: ''};
                        tagParser.urls = [];
                        tagParser.tag = {name: '', description: '', urls: tagParser.urls};
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

            if (tagParser.tagTag == 1) {
                // console.log('tagParser.tag: ' + text);
                tagParser.tag['name'] = text;
                tagParser.emit('updateTag', tagParser.tag);
            }
            else if (tagParser.urlTag == 1) {
                tagParser.url['name'] = text;
                tagParser.urls.push(tagParser.url);
            }

            if (tagParser.contentTag > 0) {
                if (tagParser.newline == 1) {
                    tagParser.tag['description'] += tagParser.tag['description'] == '' ? '':'\n';
                }
                tagParser.newline = 0;
                tagParser.tag['description'] += text;
            }
        },
        onclosetag: function (tagname) {
            // console.log('closetag ' + tagname);
            switch (tagname)
            {
                case 'p':
                    tagParser.contentTag--;
                    break;
                case 'a':
                    tagParser.urlTag--;
                    break;
                case 'h2':
                    tagParser.tagTag--;
                    break;
                default:
                    break;
            }
            // console.log("closetag " + tagname+dateTag);
        }
    });
    parser.write(result);

    parser.end();
    tagParser.emit('endOfParser');
};
