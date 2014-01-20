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
var tag = 0;
var date;
var parser = new htmlparser.Parser({
    onopentag: function (name, attribs) {
        // console.log("opentag " + name);
        switch (name)
        {
            case 'p':
                tag == 0? tag++:tag;
                break;
            case 'b':
                tag == 1? tag++:tag;
                break;
            case 'a':
                console.log(attribs);
            default:
                break;
        }
        console.log("opentag " + name + tag);
    },
    ontext: function (text) {
        console.log("text " + text);
        if (tag == 2 && text.match(/\d{2}\/\d{2}/))
        {
            console.log("match", text);
            date = text;
        }
    },
    onclosetag: function (tagname) {
        // console.log("closetag " + tagname);
        switch (tagname)
        {
            case 'p':
                tag == 1? tag--:tag;
                break;
            case 'b':
                tag == 2? tag--:tag;
                break;
            default:
                break;
        }
        console.log("closetag " + tagname+tag);
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
