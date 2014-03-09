var express = require('express');

var loader    = require('./lib/loader');
var tagloader = require('./lib/tagloader');
var dbClient  = require('./lib/db');
var app = express();

var v = '1.0';
var period = 1000 * 60 * 60;  // 1hr

tagloader.init();
tagloader.run();

loader.init();
loader.run();

setInterval(function () {
    loader.run();
    tagloader.run();

}, period);

app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    next();
});

app.get('/api/' + v + '/entry/:tag', function (req, res) {
    console.log(req.params.tag);
    var option = {'sort':[['date','desc']]};
    var filter = {};
    if(req.params.tag != 'all')
    {
        filter['tags'] = req.params.tag;
    }
    // console.log('start' + req.query.start);
    var date = {};
    if (typeof(req.query.start) != 'undefined')
    {
        date['$gte'] = req.query.start;
        filter['date'] = date;
    }
    if (typeof(req.query.end) != 'undefined')
    {
        date['$lte'] = req.query.end;
        filter['date'] = date;
    }
    if (typeof(req.query.limit) != 'undefined')
    {
        option['limit'] = req.query.limit;
    }

    dbClient.queryData(filter, option, function (result) {
        res.send(result);
        // console.log(result);
    });
});

app.get('/api/' + v + '/tags', function (req, res) {
    dbClient.queryTags(function (result) {
        res.send(result);
    });
});

var port = Number(process.env.PORT || 5000);
app.listen(port);

