'use-strict';

const http = require('http');
const config = require('./config');

// http://neo4j.com/docs/developer-manual/current/http-api/#rest-api-execute-multiple-statements

class Query {
	constructor(statement, parameters){
		this.statement = statement;
		this.parameters = parameters;
		this.name = this.constructor.name;
	}
	buildRequest() {
		const body = { statements: [{ statement: this.statement, parameters:this.parameters }] };
		return Object.assign({}, config.neoRequestOptions, {body:JSON.stringify(body)} );
	}
}

const getLicenses = new Query('MATCH (l:Licenese) RETURN l.uuid');
const getLicenseUsers = new Query('MATCH (l:Licenese {lProps}) RETURN l.uuid');

module.exports = {
	Query,
	getLicenses
};
