var loader = require('./lib/loader');
var dbClient = require('./lib/db');
var filter = {'Tags':'g0v文化部'};

// loader.init();

// loader.run();


dbClient.queryData(filter, function (result) {
    console.dir(result);
});
