'use-strict';

const cypher = require('./cypher');
const log = require('winston');
const request = require('request');
const JSONStream = require('JSONStream');
const userProfile = require('kat-client-proxies').userProfileClient;

function validateLicenses(){

}


function enrichUsersWithUUIDs(limit) {
	var statement = limit === undefined? cypher.getUsers.all : cypher.getUsers.limited;
	var req = statement.buildRequest({limit});
	var requestStream = request(req)
		.on('data', function(data){
			log.silly({op:'enrichUsersWithUUIDs', data: data.toString()});
		})
		.pipe(JSONStream.parse('results.*.data.*.row'))
		.on('data', function(data){
			userProfile.getUUID(data[0].email)
			.then(user => {
				if (user) {
					log.debug({operation:'enrichUsersWithUUIDs', user: data[0], uuid:user.id});
				} else {
					log.warn({operation:'enrichUsersWithUUIDs', warning: 'User not found', user: data[0]});
				}
			})
			.catch(err => {
				log.error(err);
			});
		})
		.on('end', function(){
			log.debug({op:'enrichUsersWithUUIDs', state:'done'});
		});
}

module.exports={
	enrichUsersWithUUIDs,
};
