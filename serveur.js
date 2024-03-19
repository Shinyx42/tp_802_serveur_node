const express = require('express');
const app  = express();
const http = require('http').Server(app);
const path = require('path');
//var io = require('socket.io')(http);
app.use(express.static(__dirname + '/data'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

require('dotenv').config();

const port = process.env.PORT;

getCity= async function (nom) {
		let url = "https://api-adresse.data.gouv.fr/search/?q=";
		url+=nom;
		let settings = { method: "Get" };
		let ret = await fetch(url, settings)
			.then(res => res.json())
			.then((json) => {
			// do something with JSON
			//console.log(json);
			return json.features[0].geometry.coordinates;
			});
		return ret;
	}
getNextBorn= async function(pos, dest, autonomie){
	let url = "https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets/bornes-irve/records?select=geo_point_borne&where=distance(geo_point_borne%2C%20geom%27POINT(";
	url+=pos[0]+"%20"+pos[1]+")%27%2C%20"+autonomie+"km)&order_by=(";
	url+="xlongitude-"+dest[0]+")*(xlongitude-"+dest[0]+")%2B(";
	url+="ylatitude-"+dest[1]+")*(ylatitude-"+dest[1]+")%20asc&limit=1";
	console.log(url);
	let settings = { method: "Get" };
	let ret = await fetch(url, settings)
		.then(res => res.json())
		.then((json) => {
		// do something with JSON
		console.log(json.results[0].geo_point_borne);
		return json;
		});
	return ret;
}	
//https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets/bornes-irve/records?select=geo_point_borne&where=distance(geo_point_borne%2C%20geom%27POINT(5.7243%2045.182081)%27%2C%2030km)&order_by=(xlongitude-5.8588)*(xlongitude-5.8588)%2B(ylatitude-45.641835)*(ylatitude-45.641835)%20asc&limit=5
//https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets/bornes-irve/records?where=distance(geo_point_borne%2C%20geom%27POINT(5.7243%2045.182081)%27%2C%2030km)&order_by=(xlongitude-5.8588)*(xlongitude-5.8588)%2B(ylatitude-45.641835)*(ylatitude-45.641835)%20asc&limit=5
app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, 'data', 'html', 'index.html'));
});

app.post('/action', function(req, res){
	console.log(req.body.depart);
	console.log(req.body.arriver);
	console.log(req.body.car);
	var dep = getCity(req.body.depart);
	var arr = getCity(req.body.arriver);
	dep.then(function(result){console.log(result);});
	arr.then(function(result){console.log(result);});
	dep.then(function(depart){
		arr.then(function(arriver){
			console.log(depart, arriver);
			var nextborne = getNextBorn(depart,arriver,30);
		});
	});
	console.log(dep, arr);
	res.send(nextborne);
	//res.redirect(301, "/");;
});

//https://api-adresse.data.gouv.fr/search/?q=
http.listen(port, function(){
	console.log('listening on *:${port}');
});
