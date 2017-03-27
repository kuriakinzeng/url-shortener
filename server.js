var app = require('express')();
app.set('view engine', 'pug');

var validUrl = require('valid-url');
var mongo = require('mongodb').MongoClient;
var rand4Numbers = function(){
    return Math.floor(Math.random()*9999);
}
var db;

mongo.connect(process.env.MONGOLAB_URI, function(err, d) {
  if(err) throw err;
  db = d;
  app.listen(process.env.PORT || 8080);
  console.log('Be listen')
});

app.get('/new/:url*',function(req,res){
    var original_url = req.url.slice(5);
    if (validUrl.isUri(original_url)){
        db.collection('urls').insert({
            'original_url':original_url,
            'short_url':rand4Numbers()
        },function(err,data){
            if(err) throw err;
            var response = {};
            response['original_url'] = data.ops[0].original_url;
            response['short_url'] = process.env.SITE_URL + '/' + data.ops[0].short_url;
            res.json(response);
        });
        // db.close();
    } else {
       res.send({"error": "Check url format"})
    }
    // db.collection('urls').createIndex({'short_url':process.env.SITE_URL+rand4Numbers()},{unique:true})
});

app.get('/:url',function(req,res){
    if(isNaN(req.params.url)){
        return res.json({"error":"Invalid Short URL"})
    }
    
    db.collection('urls').findOne({
        short_url:parseInt(req.params.url)
    }, function(err,doc){
        if (err) throw err;
        if(doc){
            res.redirect(doc.original_url); 
        } else {
            res.send({"error": "Not found"})
        }
    });
    db.close();
});

app.get('/', function (req, res) {
  res.render('index', {});
});