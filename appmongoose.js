var http = require('http'),
    fs = require('fs'),
    // NEVER use a Sync function except at start-up!
    index = fs.readFileSync(__dirname + '/index.html');

var assert = require('assert');

var mongourl = 'mongodb://localhost:27017/socketdb';

var mongoose = require('mongoose');

mongoose.connect(mongourl);

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var deviceSchema = new Schema({
    recordID : ObjectId,
    BeaconID : String,
    DeviceID : String,
    Distance : Number
});


var DeviceModel = mongoose.model('device', deviceSchema);

var DeviceInstance = new DeviceModel({DeviceID : 'A1002', BeaconID : 'BC1002', Distance : '1200'});
console.log(DeviceInstance);

DeviceInstance.save(function(err){
    if (!err) 
        console.log('Success!');
    else
        console.log(err);
});


//Device.find();

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

io.on('receiveTime', function(data){
        console.log('Data coming from client :: ');
})


// Send current time every 10 secs
setInterval(sendTime, 10000);

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
        if (!(data.id && data.device_token && data.distance)){
            console.log('Invalid data passing');
            return;
        }
        /*MongoClient.connect(url, function(err, db) {
            if(err) { return console.dir(err); }
            assert.equal(null, err);

            var collection = db.collection('device');

            collection.insert({'id' : data.id, 'device_token' : data.device_token, 'distance' : data.distance});

            db.close();
        });*/

    });

    socket.on('showDevices', function(data){
        console.log('Hitting');
        /*MongoClient.connect(url, function(err, db) {
            if(err) { return console.dir(err); }
            assert.equal(null, err);

            var collection = db.collection('device');
            var devicelist = [];
            collection.find().toArray(function(err, result){

                console.log('Results :: ' + JSON.stringify(result));
            })            

            db.close();
        });*/

    });

    
});

app.listen(5200);