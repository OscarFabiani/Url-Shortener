'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

process.env.MONGO_URI = 'mongodb+srv://spartan539:popcorn1@cluster0-m1tag.mongodb.net/test?retryWrites=true&w=majority';


mongoose.connect(process.env.MONGO_URI);


var urlSchema = new mongoose.Schema({
  original_url: {type: String, required: true},
  short_url: {type: Number}
});


var Url = mongoose.model('Url', urlSchema);


var testUrl = "https://oscarfabiani.com";
var testUrl2 = "https://gamefaqs.com";
var testUrl3 = "https://google.com";



//This function takes a url, then counts the documents in the collection,
//then trys to find a document with that url, then, if it doesn't, creates
//a new Url document setting the original_url property to the url argument
//passed and sets the short_url property to one more than the number of
//documents in the collection, then saves the new document.
function grand(url) {
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
          return doc;
        });
      } else {
        console.log('already exists: ' + docs);
        doc.short_url = docs[0].short_url;
        console.log('doc:');
        console.log(doc);
        return doc;
      }
    })
  })
}

/*
Url.findOne({short_url: 3}, function(err, doc) {
  if (err) {console.log(err)};
  console.log(doc);
})
*/


//grand(testUrl3);


/*
new Url({
  original_url: "https://oscarfabian.com",
  short_url: 2
}).save(function (err, product) {
  if (err) {
    console.log('error: ' + err);
  }
  console.log('product: ' + product)
  return product;
});
*/


/*
var countt;

Url.countDocuments(function(err, data) {
  if (err) {
    return err;
  }
  console.log('data2: ' + data);
  countt = data;
  return data;
})

console.log('countt: ' + countt);
*/



/*
Url.find({original_url: "https://oscarfabian.com"}, function(err, data) {
  if (err) {console.log('err1: ' + err)};
  if (data == '') {
    testUrl.save(function (err, product) {
    if (err) { console.log('error2: ' + err)};
  console.log('product: ' + product)
  return product;
});
  };
  console.log('already exists: ' + data);
  return data;
})
*/


app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(express.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


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


/*
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
*/


/*
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



app.listen(port, function () {
  console.log('Node.js listening ...');
});