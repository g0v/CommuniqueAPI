var express = require('express');

var loader = require('./lib/loader'),
    dbClient = require('./lib/db');

var app = express.createServer();

var v = '1.0';

loader.init();
loader.run();

app.get('/api/' + v + '/entry/:tag', function (req, res) {
    console.log(req.params.tag);
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

    dbClient.queryData(filter, function (result) {
        res.send(result);
        // console.log(result);
    });
});

var port = Number(process.env.PORT || 5000);
app.listen(port);

