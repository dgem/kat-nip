'use-strict';

const config = require('./config');

// http://neo4j.com/docs/developer-manual/current/http-api/#rest-api-execute-multiple-statements

class Query {
	constructor(statement, parameters){
		this.statement = statement;
		this.parameters = parameters;
		this.name = this.constructor.name;
	}
	buildRequest(parameters) {
		const body = { statements: [{statement: this.statement, parameters: Object.assign({}, this.parameters, parameters)}] };
		return Object.assign({}, config.neoRequestOptions, {body:JSON.stringify(body)} );
	}
}

const getLicenses = {
	all: new Query('MATCH (l:Licenese) RETURN l.uuid'),
	limited: new Query('MATCH (l:Licenese) RETURN l.uuid LIMIT {limit}')
};

const getUsersOnLicense = {
	all: new Query('MATCH (l:Licenese {uuid: uuid})-[m:member]-(u:User) RETURN l.uuid,u.uuid'),
	limited: new Query('MATCH (l:Licenese {uuid: uuid})-[m:member]-(u:User) RETURN l.uuid,u.uuid LIMIT {limit}')
};

const getUsers = {
	all: new Query('MATCH (u:User) RETURN u'),
	limited: new Query(`MATCH (u:User) RETURN u LIMIT {limit}`)
};

const updateUserByEmail = new Query('MATCH (u:User {email: {email}}) SET u += {user} RETURN u');

module.exports = {
	Query,
	getLicenses,
	getUsersOnLicense,
	getUsers,
	updateUserByEmail
};
