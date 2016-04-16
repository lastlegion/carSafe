var express = require('express');
var router = express.Router();


var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;

var url = "mongodb://localhost:27017/carSafe";

// Twilio Credentials 
var accountSid = 'ACde299be13d809afcb5dec8481579c6db'; 
var authToken = 'b36dae7c1c7e01cb4ae02fbac369f28e'; 
 
//require the Twilio module and create a REST client 
var client = require('twilio')(accountSid, authToken); 
 

/* Get recent CO Level */

 
/* Get recent temperature */
router.get('/api/getCurrentMetrics', function(req, res, next){
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        //HURRAY!! We are connected. :)
        console.log('Connection established to', url);

        // Get the documents collection
        var collection = db.collection('metrics');

        // Insert some users
        collection.find({type: 'metric'}).sort({"timeStamp": -1}).toArray(function (err, result) {
          if (err) {
            console.log(err);
          } else if (result.length) {
            console.log('Found:', result);
          } else {
            console.log('No document(s) found with defined "find" criteria!');
          }
          res.json(result[0]);
          //Close connection
          db.close();
        });
      }
    });
});
 

 
/* Get recent temperature */
router.get('/api/getTemperature', function(req, res, next){
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        //HURRAY!! We are connected. :)
        console.log('Connection established to', url);

        // Get the documents collection
        var collection = db.collection('metrics');

        // Insert some users
        collection.find({type: 'temperature'}).sort({"timeStamp": 1}).toArray(function (err, result) {
          if (err) {
            console.log(err);
          } else if (result.length) {
            console.log('Found:', result);
          } else {
            console.log('No document(s) found with defined "find" criteria!');
          }
          res.json(result);
          //Close connection
          db.close();
        });
      }
    });
});


    // Return TwiML instuctions for the outbound call
    router.post('/outbound', function(request, response) {
        // We could use twilio.TwimlResponse, but Jade works too - here's how
        // we would render a TwiML (XML) response using Jade
        response.type('text/xml');
        response.render('outbound');
    });

// Handle an AJAX POST request to place an outbound call
router.post('/call', function(request, response) {
    // This should be the publicly accessible URL for your application
    // Here, we just use the host for the application making the request,
    // but you can hard code it or use something different if need be
    var url = 'http://' + request.headers.host + '/outbound';
    
    // Place an outbound call to the user, using the TwiML instructions
    // from the /outbound route
    client.makeCall({
        to: request.body.phoneNumber,
        from: config.twilioNumber,
        url: url
    }, function(err, message) {
        console.log(err);
        if (err) {
            response.status(500).send(err);
        } else {
            response.send({
                message: 'Thank you! We will be calling you shortly.'
            });
        }
    });
}); 

/* POST temperature */
router.post('/api/metric', function(req, res, next){
    var metric = req.body;
    metric.timeStamp = Date.now();
    //console.log(metric.username);
    //res.json(metric);
    console.log(metric); 
    MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log('Unable to connect to the mongoDB server. Error:', err);
        } else {
            //HURRAY!! We are connected. :)
            console.log('Connection established to', url);

            // Get the documents collection
            var collection = db.collection('metrics');

            // Insert some users
            collection.insert(metric, function (err2, result) {
                if (err2) {
                    console.log(err2);
                } else {
                    console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
                }
                if(metric.colevels == "danger"){
                    client.messages.create({ 
                        to: "+19145007744", 
                        from: "+15163310465", 
                        body: "[CarSafe Warning] Dangerous CO Levels ",   
                    }, function(err, message) { 
                        if(err){
                            console.log(err);
                        }
                        else{
                            console.log(message.sid); 
                        }                
                        //Close connection
                        db.close();
                        res.json({"pushed": result});

                     });
                } else { 
                    //Close connection
                    db.close();
                    res.json({"pushed": result});
                }
            });
        }      

    });
   
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
