'use-strict';

const expect = require("chai").expect;
const Query = require('../lib/cypher').Query;
const cypher = require('../lib/cypher');
const request = require('request');
const expectOwnProperties = require('./expectOwnProperties');
const JSONStream = require('JSONStream');


describe('Query specs', function () {
	const simpleMatch = new Query('MATCH (x) RETURN id(x) LIMIT 1');

	function checkQueryExecutedOK(err, res, body) {
		expect(err).to.be.null;
		expect(res.statusCode).to.equal(200);
		expect(body).to.not.be.null;
		expect(JSON.parse(body).errors).to.eql([]);
	}

	function checkQueryResponseBody(body){
		// {"results":[{"columns":["id(x)"],"data":[{"row":[142966],"meta":[null]}]}],"errors":[]}
		var jsonObj = JSON.parse(body);
		expect(jsonObj).to.have.ownProperty('results');
		expect(jsonObj.results).to.be.instanceof(Array);
		expectOwnProperties(jsonObj.results, ['columns', 'data']);
	}

	it('should be possible to construct a query', function(){
		var req = simpleMatch.buildRequest();
		expectOwnProperties(req, ['headers', 'url', 'method', 'body']);
		expectOwnProperties(JSON.parse(req.body), ['statements']);
	});

	it('should be possible to retrieve something using a request callback', function(done){
		var req = simpleMatch.buildRequest();
		request(req, function(err, res, body) {
			checkQueryExecutedOK(err, res, body);
			checkQueryResponseBody(body);
			done();
		});
	});

	it('should be possible to stream something using a request', function(done) {
		var req = simpleMatch.buildRequest();
		const chunks = [];
		var requestStream = request(req)
			.on('data', function(data){
		  	chunks.push(data);
			})
			.on('end',function(){
			 checkQueryResponseBody(chunks.toString());
			 done();
		});
	});

	it('should be possible to stream multiple things through JSONStreamer', function(done){
		var matchMany = new Query('MATCH (x) RETURN id(x) LIMIT 10');
		var req = matchMany.buildRequest();
		var rows = 0;
		var requestStream = request(req)
			.pipe(JSONStream.parse('results.*.data.*.row'))
			.on('data', function(data){
				expect(data).is.instanceof(Array);
				rows ++;
			})
			.on('end', function(){
				expect(rows).to.be.at.least(2);
				done();
			});
	});

	it('should be possible to stream a parameterised query through JSONStreamer', function(done){
		request(new Query('CREATE (c:Car {make :"VW", model:"Beetle"}) RETURN c').buildRequest(),
			function(err, res, body) {
				checkQueryExecutedOK(err, res, body);
				var params = {make : 'VW', model: 'Beetle'};
				var matchCar = new Query('MATCH (x:Car {make: {make}, model:{model}}) RETURN x LIMIT {limit}', Object.assign({},params,{limit:100}));
				var rows = 0;
				request(matchCar.buildRequest())
				.pipe(JSONStream.parse('results.*.data.*.row'))
				.on('data', function(data){
					expect(data).is.instanceof(Array);
					data.forEach((car)=> {
						expect(car).to.eql(params);
					});
					rows ++;
				})
				.on('end', function(){
					expect(rows).to.be.at.least(1);
					request(new Query('MATCH (c:Car {make :"VW", model:"Beetle"}) DELETE c').buildRequest(),
						function(err, res, body) {
							checkQueryExecutedOK(err, res, body);
							done();
						}
					);
				});
			}
		);
	});

	it('should be possible to get 10 Users', function(done){
		var statement = cypher.getUsers.limited;
		var req = statement.buildRequest({limit:10});
		var rows = 0;
		var requestStream = request(req)
			// .on('data', function(data){
			// 	console.log(data.toString());
			// })
			.pipe(JSONStream.parse('results.*.data.*.row'))
			.on('data', function(data){
				// console.log(data);
				expect(data).is.instanceof(Array);
				rows ++;
			})
			.on('end', function(){
				expect(rows).to.equal(10);
				done();
			});
	});

});
