'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns');
var app = express();


//This shows that I don't seem to need to require 'url.URL' to access the URL object
const testUrl = new URL('http://www.gamefaqs.com');
console.log(testUrl);


// body-parser
app.use(express.urlencoded({extended: false}));

// serving static files in the '/public' folder
app.use('/public', express.static(process.cwd() + '/public'));

// sending '/views.index.html' to the root.
app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});



process.env.MONGO_URI = 'mongodb+srv://spartan539:popcorn1@cluster0-m1tag.mongodb.net/test?retryWrites=true&w=majority';


mongoose.connect(process.env.MONGO_URI);


var urlSchema = new mongoose.Schema({
  original_url: {type: String, required: true},
  short_url: {type: Number}
});


var Url = mongoose.model('Url', urlSchema);




//COMPARE WITH EXAMPLE AND OPTIMIZE (POSSIBLY ELIMINATE URL MODULE)
app.route("/api/shorturl/new")
.post(function(req, res) {
  var url = req.body.url;
  if (!url.match(/^https?:\/\/..*/i)) {
    res.json({error: "Invalid URL"});
  } else {
    var href = new URL(url);
    dns.lookup(href.hostname, function(err) {
      if (err) {
        res.json({error: "Invalid Hostname"});
      } else {
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
      }
    })
  }
})




app.route("/api/shorturl/:short")
.get(function(req, res) {
  var short = req.params.short;
  console.log('short: ' + short);
  Url.findOne({short_url: short}, function(err, doc) {
    if (err) {console.log('erer: ' + err)};
    if (doc == null) {
      res.json({error: "No short url found for given input"});
    } else {
      console.log('doc: ' + doc);
      res.redirect(doc.original_url);
    }
  })
});



app.listen(3000, function () {
  console.log('Node.js listening ...');
});




//WRITE COMMENTS FOR ROUTES
//FIRGURE OUT WHAT CORS IS
//TEST REMOVING REQUIRE('MONGODB')
//FINISH OPTIMIZING ROUTES
//EXPLORE CHANGING FILE STRUCTURE
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