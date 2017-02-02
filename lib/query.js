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

const getLicenses = {
	all: new Query('MATCH (l:Licenese) RETURN l.uuid'),
	limited: new Query('MATCH (l:Licenese) LIMIT {limit} RETURN l.uuid')
};
const getUsersOnLicense = {
	all: new Query('MATCH (l:Licenese {uuid: uuid})-[m:member]-(u:User) RETURN l.uuid,u.uuid'),
	limited: new Query('MATCH (l:Licenese {uuid: uuid})-[m:member]-(u:User) LIMIT {limit} RETURN l.uuid,u.uuid')
};

module.exports = {
	Query,
	getLicenses,
	getUsersOnLicense
};
