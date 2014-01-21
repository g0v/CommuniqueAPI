var config = require('./config');
var Hackpad = require('hackpad');
var htmlparser = require('htmlparser2');
var hackpadClient = new Hackpad(config.hackpad.client, config.hackpad.secret, config.hackpad);

// var handler = new htmlparser.DomHandler(function (err, dom) {
//     if (err) 
//     {
//         console.log(err);
//     }
//     else
//     {
//         console.log(dom[2].children[3]);
//     }
// });

// var parser = new htmlparser.Parser(handler);
var dateTag    = 0;
var urlTag     = 0;
var contentTag = 0;

var url  = {'name': '', 'url': ''};
var urls = [];
var item = {'date': '', 'content': '', 'urls': urls};
var date = '';
var parser = new htmlparser.Parser({
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
                url['url'] = attribs['href'];
                console.log(url['url']);
                break;
            case 'ul':
                contentTag == 0 ? contentTag++:contentTag;
                break;
            case 'li':
                contentTag == 1 ? contentTag++:contentTag;
                break;
            default:
                break;
        }
        console.log("opentag " + name + dateTag);
    },
    ontext: function (text) {
        console.log("text " + text);
        if (dateTag == 2 && text.match(/\d{2}\/\d{2}/))
        {
            console.log("match date", text);
            date = text;
        }
        else if (contentTag > 0 && date != '') 
        {
            item['content'] += text;
            console.log(item['content']);
            if(urlTag > 0)
            {
                url['name'] = text;
                urls.push(url);
                console.log(urls[0].name);
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
                break;
            case 'li':
                contentTag == 2 ? contentTag--:contentTag;
                item['date'] = date;

                break;
            default:
                break;
        }
        console.log("closetag " + tagname+dateTag);
    }
});


hackpadClient.export(config.padID[0], "latest", "html", function (err, result) {
    console.log(config.padID[0]);
    if(err)
    {
        console.log(err);
    }
    else
    {
        parser.write(result);
        parser.end();
    }
});
