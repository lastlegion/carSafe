var express = require('express');
var router = express.Router();


var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;

var url = "mongodb://localhost:27017/carSafe";

 
/* Get recent temperature */
router.get('/api/t', function(req, res, next){
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
                
                //Close connection
                db.close();
                res.json({"pushed": result});
            });
        }      

    });
   
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
