'use strict';

var express = require('express');
var mongoose = require('mongoose');
var dns = require('dns');


var app = express();

// body-parser
app.use(express.urlencoded({extended: false}));

// serving static files in the '/public' folder
app.use('/public', express.static(process.cwd() + '/public'));

// sending '/views.index.html' to the root.
app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


//setting environment variable for mongodb
process.env.MONGO_URI = 'mongodb+srv://spartan539:popcorn1@cluster0-m1tag.mongodb.net/test?retryWrites=true&w=majority';

//connecting to mongodb through mongoose
mongoose.connect(process.env.MONGO_URI);

//creating schema for url documents
var urlSchema = new mongoose.Schema({
  original_url: {type: String, required: true},
  short_url: {type: Number}
});

//creating model for url documents
var Url = mongoose.model('Url', urlSchema);




app.route("/api/shorturl/new")
.post(function(req, res) {

  //variable for url property of body property of request object
  var url = req.body.url;

  //checks if the url starts with http(s):// and sends an error response if not
  if (!url.match(/^https?:\/\/..*/i)) {
    res.json({error: "Invalid URL"});
  } else {

    //variable for URL object
    var href = new URL(url);

    //Uses dns module to test the hostname property of the href URL object and sends an error
    //response if the hostname is unresolved
    dns.lookup(href.hostname, function(err) {
      if (err) {
        res.json({error: "Invalid Hostname"});
      } else {

        //checks if the database collection already contains a document for the url 
        Url.find({original_url: url}, function(err, docs) {
          if (err) {console.log('err2: ' + err)};

          //checks if the document array returned is empty (no matching document for url)
          if (docs == '') {

            //counts the documents in the database collection
            Url.countDocuments(function(err, count) {
              if (err) {console.log('err1: ' + err)};
              console.log('count: ' + count);

              //variable for json response and new Url document
              var doc = {original_url: url, short_url: count + 1};

              //creates a new Url document and saves it to the database collection
              new Url(doc)
              .save(function (err, newDoc) {
                if (err) { console.log('err3: ' + err)};
                console.log('newDoc: ' + newDoc);
                console.log('doc:');
                console.log(doc);

                //sends a respopnse containing the doc object (simplified document information
                //omitting _id and __v properties)
                res.json(doc);
              })
            })
          } else {
            console.log('already exists: ' + docs);

            //variable for json response
            var doc = {original_url: url, short_url: docs[0].short_url};
            console.log('doc:');
            console.log(doc);

            //sends a response containing simplified information for the existing document
            res.json(doc);
          }
        })
      }
    })
  }
})




app.route("/api/shorturl/:short")
.get(function(req, res) {
  var short = req.params.short;
  console.log('short: ' + short);
  Url.findOne({short_url: short}, function(err, doc) {
    if (err) {console.log('err: ' + err)};
    if (doc == null) {
      res.json({error: "No short url found for given input"});
    } else {
      console.log('doc: ' + doc);
      res.redirect(doc.original_url);
    }
  })
});


// Answer not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});



app.listen(3000, function () {
  console.log('Node.js listening ...');
});




//WRITE COMMENTS FOR ROUTES
//EXPLORE CHANGING FILE STRUCTURE
//EXPLORE CONVERTING CALLBACKS TO PROMISES
//POSSIBLY REWORK INDEX.HTML AND STYLE.CSS






/*

OLD /API/SHORTURL/NEW ROUTES


app.route("/api/shorturl/new")
.post(function(req, res) {
  var url = req.body.url;
  Url.find({original_url: url}, function(err, docs) {
    if (err) {console.log('err2: ' + err)};
    if (docs == '') {
      Url.countDocuments(function(err, count) {
        if (err) {console.log('err1: ' + err)};
        console.log('count: ' + count);
        var doc = {original_url: url, short_url: count + 1};
        new Url(doc)
        .save(function (err, newDoc) {
          if (err) { console.log('err3: ' + err)};
          console.log('newDoc: ' + newDoc);
          console.log('doc:');
          console.log(doc);
          res.json(doc);
        })
      })
    } else {
      console.log('already exists: ' + docs);
      var doc = {original_url: url, short_url: docs[0].short_url};
      console.log('doc:');
      console.log(doc);
      res.json(doc);
    }
  })
})


app.route("/api/shorturl/new")
.post(function(req, res) {
  var url = req.body.url;
  var doc = {
    original_url: url,
    short_url: 0
  };
  Url.countDocuments(function(err, count) {
    if (err) {console.log('err1: ' + err)};
    console.log('count: ' + count);
    Url.find({original_url: url}, function(err, docs) {
      if (err) {console.log('err2: ' + err)};
      if (docs == '') {
        new Url({
          original_url: url,
          short_url: count + 1
        }).save(function (err, newDoc) {
          if (err) { console.log('err3: ' + err)};
          console.log('newDoc: ' + newDoc);
          doc.short_url = count + 1;
          console.log('doc:');
          console.log(doc);
          res.json(doc);
        });
      } else {
        console.log('already exists: ' + docs);
        doc.short_url = docs[0].short_url;
        console.log('doc:');
        console.log(doc);
        res.json(doc);
      }
    })
  })
})



*/