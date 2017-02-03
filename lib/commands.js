'use-strict';

const cypher = require('./cypher');
const log = require('winston');
const request = require('request');
const JSONStream = require('JSONStream');
const userProfile = require('kat-client-proxies').userProfileClient;

function validateLicenses(){

}


function enrichUsersWithUUIDs(limit) {
	var getUsers = new cypher.Query(`MATCH (u:User) WHERE u.membershipChecked is null RETURN u ${limit !== undefined? "LIMIT {limit}":""}`)
	var req = getUsers.buildRequest({limit});
	var requestStream = request(req)
		.on('data', function(data){
			log.silly({op:'enrichUsersWithUUIDs', data: data.toString()});
		})
		.pipe(JSONStream.parse('results.*.data.*.row'))
		.on('data', function(data){
			let email = data[0].email;
			userProfile.getUUID(email)
			.then(user => {
				var update;
				if (user) {
					update = cypher.updateUserByEmail.buildRequest({email, user:{uuid:user.id, membershipChecked:true}});
				} else {
					log.warn({operation:'enrichUsersWithUUIDs', warning: 'User not found', user: data[0]});
					update = cypher.updateUserByEmail.buildRequest({email, user:{membershipChecked:true}});
				}
				log.silly({operation:'enrichUsersWithUUIDs', update});
				request(update, (err, res, body) => {
					log.silly({operation:'enrichUsersWithUUIDs', err, status: res.statusCode, body});
					if (err) {
						log.error(err);
					} else {
						try {
							let neoResp = JSON.parse(body);
							if (neoResp.errors.length === 0) {
								log.debug({operation:'enrichUsersWithUUIDs', status:'updated', user: neoResp.results[0].data[0].row[0]});
							}
						} catch (err) {
							log.error(err);
						}
					}
				});
			})
			.catch(err => {
				log.error(err);
			});
		})
		.on('end', function(){
			log.debug({op:'enrichUsersWithUUIDs', state:'end of input stream'});
		});
}

module.exports={
	enrichUsersWithUUIDs,
};
