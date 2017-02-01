#! /usr/bin/env node --harmony
'use strict';
const program = require('commander');
const log = require ('winston');

var sourceUrl;

program
  .version('0.0.1')
	.option('-l, --logLevel [silly|debug|info|warn|error]', 'set logLevel to output')
	.option('-n, --neoUrl', 'set neo4j db URL, defaults to http://localhost:7477');

program
	.command('checkLicences')
	.option('-m, --max [number]', 'limit number of licences to process')
	.action(function(options){
		setLogLevel(program.logLevel);
		log.debug({op:'checkLicences', logLevel: program.logLevel, max:options.max});
	});

program.parse(process.argv);

function setLogLevel(level) {
	log.level = level || process.env.LOG_LEVEL || 'debug';
}
