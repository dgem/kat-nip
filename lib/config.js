'use-strict';

const host = process.env['NEO4J_URL'] || 'http://localhost:7474';
const url =  host + "/db/data/transaction/commit";
const defaultRequestOptions = {
	method: 'POST',
	timeout: 300000,
	headers: {
			'accept': 'application/json',
			'content-type': 'application/json'
	},
};

const neoRequestOptions = Object.assign({}, defaultRequestOptions, {url, method:'POST', 'X-Stream': 'true'});

module.exports={
	neoRequestOptions
};
