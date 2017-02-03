#! /usr/bin/env node --harmony
'use strict';
const program = require('commander');
const log = require('winston');
const commands = require('./lib/commands');

var sourceUrl;

program
  .version('0.0.1')
	.option('-l, --logLevel [silly|debug|info|warn|error]', 'set logLevel to output')
	.option('-n, --neoUrl', 'set neo4j db URL, defaults to http://localhost:7477');

program
	.command('checkLicences')
	.option('-m, --max [number]', 'limit number of licences to process', parseInt)
	.action(function(options){
		setLogLevel(program.logLevel);
		log.silly({op:'checkLicences', logLevel: program.logLevel, max:options.max});
	});

program
	.command('enrichUsersWithUUIDs')
	.option('-m, --max [number]', 'limit number of users to process', parseInt)
	.action(function(options){
		setLogLevel(program.logLevel);
		log.silly({op:'enrichUsersWithUUIDs', logLevel: program.logLevel, max:options.max});
		commands.enrichUsersWithUUIDs(options.max);
	});

program.parse(process.argv);

function setLogLevel(level) {
	log.level = level || process.env.LOG_LEVEL || 'info';
}
