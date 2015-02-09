var express = require('express');
var app = express();
var mongojs = require('mongojs');
var db = mongojs('poiList', ['poiList']);
var bodyParser = require('body-parser');

//setting enviroments

app.use(express.static(__dirname + "public"));
app.use(bodyParser.json());


app.get('/poiList', function(req, res) {
	console.log('Received a GET request')

	db.poiList.find(function(err, docs){
		console.log(docs);
		res.json(docs);

	});
});

app.post('/poiList', function(req, res) {
	console.log(req.body);
	db.poiList.insert(req.body, function(err, doc){
		res.json(doc);
	})
});

app.delete('/poiList/:id', function (req, res){
	var id = req.params.id;
	console.log(id);
	db.poiList.remove({_id: mongojs.ObjectId(id)}, function (err, doc) {
		res.json(doc);
	})
});

app.get('/poiList/:id', function (req, res) {
	var id = req.params.id;
	console.log(id);
	db.poiList.findOne({_id: mongojs.ObjectId(id)}, function (err, doc) {
		res.json(doc);

	});

});

app.put('/poiList/:id', function (req, res) {
	var id = req.params.id;
	console.log(req.body.name);
	db.poiList.findAndModify({query: {_id: mongojs.ObjectId(id)},
		update: {$set: {name: req.body.name, email: req.body.email, number: req.body.number}},
		new: true}, function (err, doc) {
			res.json(doc);
		});
});

app.listen(3000);
console.log("server running on port 3000")