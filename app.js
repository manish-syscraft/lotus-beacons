var http = require('http'),
fs = require('fs'),
// NEVER use a Sync function except at start-up!
index = fs.readFileSync(__dirname + '/index.html');

var MongoClient = require('mongodb').MongoClient;
//var MongoSyncServer = require("mongo-sync").Server;
var assert = require('assert');
var async = require('async');


var mongourl = 'mongodb://lotus:remote@ds161255.mlab.com:61255/lotusbeacon';
//var mongourlwodb = 'mongodb://localhost:27017';
MongoClient.connect(mongourl, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server.");
  db.close();
});

// Send index.html to all requests
var app = http.createServer(function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.end(index);
});

// Socket.io server listens to our app
var io = require('socket.io').listen(app);

// Send current time to all connected clients
function sendTime() {
    io.emit('time', {
        time: new Date().toJSON()
    });
}

/*function sendDevices() {
    io.emit('showDevices', function(data){
        console.log('Hitting');
        MongoClient.connect(mongourl, function(err, db) {
            if(err) { return console.dir(err); }
            assert.equal(null, err);

            var collection = db.collection('device');
            var devicelist = [];
            collection.find().toArray(function(err, result){

                console.log('Results :: ' + JSON.stringify(result));
            })            

            db.close();
        });

    });
}*/

//sendDevices();

io.on('receiveTime', function(data){
        console.log('Data coming from client :: ');
})


/*MongoClient.connect(mongourl, function(err, db) {
    if(err) { return console.dir(err); }
    assert.equal(null, err);

    var collection = db.collection('device');
    var devicelist = [];
    collection.find().toArray(function(err, result){

        console.log('Results :: ' + JSON.stringify(result));
    })            

    db.close();
});*/


// Send current time every 10 secs
//setInterval(sendTime, 10000);

// Emit welcome message on connection
io.on('connection', function(socket) {
    // Use socket to communicate with this particular client only, sending it it's own id
    socket.emit('welcome', {
        message: 'Welcome!',
        id: socket.id
    });

    /* Hitting from Client */
    socket.on('receiveTime', function(data){
        console.log('Coming with Data :: ' + JSON.stringify(data));
    });

    socket.on('updateDevice', function(data){
        if (!(data.BeaconID && data.DeviceID && data.Distance)){
            //console.log('Invalid data passing');
            io.emit('updateDevice_response', {
                'IsSuccess' : false,
                'message' : 'Invalid data passing'
            });
            return;
        }
        MongoClient.connect(mongourl, function(err, db) {
            if(err) { return console.dir(err); }
            assert.equal(null, err);

            var collection = db.collection('device');

            collection.insert({'BeaconID' : data.BeaconID, 'DeviceID' : data.DeviceID, 'Distance' : data.Distance });

            io.emit('updateDevice_response', {
                'IsSuccess' : true,
                'message' : 'Data inserted successfully'
            });

            sendDevices();

            db.close();
        });

    });

    function sendDevices() {
        /*var MongoSyncServerObj = new MongoSyncServer(mongourlwodb);
        var result = MongoSyncServerObj.db("socketdb").getCollection("device").find().toArray();*/

        async.waterfall([
            function(callback){
                MongoClient.connect(mongourl, function(err, db) {
                    if(err) { return console.dir(err); }

                    var collection = db.collection('device');
                    var devicelist = new Array();
                    collection.find().toArray(function(err, devices){
                        for(var dvc in devices){
                            devicelist.push(devices[dvc]);
                        }
                        callback(null, devicelist);
                    })
                    db.close();
                });
            },
            function(devicelist, callback){
                io.emit('showDevices', devicelist);
                callback(null, devicelist);
            }
        ]);
    }
    sendDevices();
    //setInterval(sendDevices, 5000);
});

app.listen(process.env.PORT || 3000, function(){
  console.log("App started with Mongodb");
});