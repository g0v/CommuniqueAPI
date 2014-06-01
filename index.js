var express = require('express');

var loader    = require('./lib/loader');
var dbClient  = require('./lib/db');
var historyloader = require('./lib/historyloader');

var app = express();

var v = '1.0';
var v2 = '2.0';
var period    = 1000 * 60 * 60;  // 1hr
var tagPeriod = 1000 * 60 * 60;

dbClient.init();

loader.init(dbClient);
loader.run();

// historyloader.init();
// historyloader.run();

var entryInterval = setInterval(function () {
    loader.run();
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

app.get('/api/' + v + '/tags/:id', function (req, res) {
    dbClient.queryTags(req.params.id, function (result) {
        res.send(result);
    });
});

app.get('/api/' + v2 + '/hackpadData', function (req, res) {
    res.send(historyloader.getHackpadData());
});

app.get('/api/' + v2 + '/hackpadHistory', function (req, res) {
    res.send(historyloader.getHackpadHistory());
});

app.get('/api/' + v2 + '/hackpadList', function (req, res) {
    res.send(historyloader.getHackpadList());
});

app.get('/api/' + v2 + '/hackpadAuthors', function (req, res) {
    res.send(historyloader.getHackpadAuthors());
});

var port = Number(process.env.PORT || 5000);
app.listen(port);
