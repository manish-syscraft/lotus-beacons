/*Node Modules*/
var express = require('express');

var http = require('http'),
    fs = require('fs'),
    // NEVER use a Sync function except at start-up!
    index = fs.readFileSync(__dirname + '/index.html');

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var async = require('async');
var gcm = require('node-gcm');
var GcmGoogleKey = 'AIzaSyAjC3iT71YD0dH2vqVJaTTi8dAXadB7gPs';

var mongourl = 'mongodb://lotus:remote@ds161255.mlab.com:61255/lotusbeacon';
MongoClient.connect(mongourl, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server.");
    db.close();
});

// Send index.html to all requests
var server = http.createServer(function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.end(index);
});

var app = express();
app.use('/', express.static(__dirname + '/angular/'));

// Socket.io server listens to our app
var io = require('socket.io').listen(server);

// Send current time to all connected clients
function sendTime() {
    io.emit('time', {
        time: new Date().toJSON()
    });
}

io.on('receiveTime', function(data) {
    console.log('Data coming from client :: ');
})

// Emit welcome message on connection
/*io.on('connection', function(socket) {
    // Use socket to communicate with this particular client only, sending it it's own id
    socket.emit('welcome', {
        message: 'Welcome!',
        id: socket.id
    });

    // Hitting from Client 
    socket.on('receiveTime', function(data) {
        console.log('Coming with Data :: ' + JSON.stringify(data));
    });

    socket.on('updateDevice', function(data) {
        if (!(data.BeaconID && data.DeviceID && data.Distance)) {
            //console.log('Invalid data passing');
            io.emit('updateDevice_response', {
                'IsSuccess': false,
                'message': 'Invalid data passing'
            });
            return;
        }
        MongoClient.connect(mongourl, function(err, db) {
            if (err) {
                return console.dir(err);
            }
            assert.equal(null, err);

            var collection = db.collection('device');

            collection.insert({
                'BeaconID': data.BeaconID,
                'DeviceID': data.DeviceID,
                'Distance': data.Distance
            });

            io.emit('updateDevice_response', {
                'IsSuccess': true,
                'message': 'Data inserted successfully'
            });

            sendDevices();

            db.close();
        });

    });

    function sendDevices() {
        // var MongoSyncServerObj = new MongoSyncServer(mongourlwodb);
        //var result = MongoSyncServerObj.db("socketdb").getCollection("device").find().toArray();

        async.waterfall([

            function(callback) {
                MongoClient.connect(mongourl, function(err, db) {
                    if (err) {
                        return console.dir(err);
                    }

                    var collection = db.collection('device');
                    var devicelist = new Array();
                    collection.find().toArray(function(err, devices) {
                        for (var dvc in devices) {
                            devicelist.push(devices[dvc]);
                        }
                        callback(null, devicelist);
                    })
                    db.close();
                });
            },
            function(devicelist, callback) {
                io.emit('showDevices', devicelist);
                callback(null, devicelist);
            }
        ]);
    }
    //sendDevices();
    //setInterval(sendDevices, 5000);
});*/

app.listen(process.env.PORT || 3000, function() {
    console.log("App started with Mongodb");
});

app.post('/user/loggedinUser', function(req, res) {
    var resObj = {};
    if (req.session.loggedInUser) {
        var userObjLocal = {};
        userObjLocal.userid = 101;
        userObjLocal.firstname = 'admin';

        resObj.user = userObjLocal;
        resObj.isSuccess = true;
        res.send(resObj);
    } else {
        resObj.isSuccess = false;
        res.send(resObj);
    }
});

app.post('/user/login', function(req, res) {
    var resObj = {};

    if (req.body.username == 'admin' && req.body.password == 'remote@123') {
        req.session.loggedInUser
        resObj.message = "Successfully loggedin!"
        resObj.isSuccess = true;
        user.password = '';
        var userObjLocal = {};

        userObjLocal.userid = 101;
        userObjLocal.firstname = 'admin';

        resObj.user = userObjLocal;
        req.session.loggedInUser = userObjLocal;
    } else {
        req.session.loggedInUser = null;
        resObj.message = "Invalid password"
        resObj.isSuccess = false;
    }

    res.send(resObj);
});

app.post('/getdata', function(req, res) {
    MongoClient.connect(mongourl, function(err, db) {
        if (err) {
            return console.dir(err);
        }

        var collection = db.collection('device');
        var devicelist = new Array();
        collection.find().toArray(function(err, devices) {
            for (var dvc in devices) {
                devicelist.push(devices[dvc]);
            }
            res.send(devicelist);
        })
        db.close();
    });
});

app.post('/sendpushnotification', function(req, res) {
    
    var message = new gcm.Message({
        collapseKey: 'demo',
        priority: 'high',
        contentAvailable: true,
        delayWhileIdle: true,
        timeToLive: 3,
        restrictedPackageName: "Lotus_beacon",
        dryRun: true,
        data: {
            key1: 'message1',
            key2: 'message2'
        },
        notification: {
            title: "Hello, World",
            icon: "",
            body: "This is a notification that will be displayed ASAP."
        }
    });
     
    // Set up the sender with you API key, prepare your recipients' registration tokens. 
    var sender = new gcm.Sender();
    var regTokens = ['APA91bGiy3M07dBALUK8yrAOb7_QjQ8o7n3Ax4fj0tHZaQgu-X9O4kNlz-DnLwWM_wmU3u3WzjLf61qhQD4ok2yvNCvEXY9icj8lfQRWOcFrIjp8_HleS3I'];
     
    sender.send(message, { registrationTokens: regTokens }, function (err, response) {
        if(err) console.error(err);
        else    console.log(response);
    });
});