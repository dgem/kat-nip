'use-strict';

const request=require('request');
const Transform = require('stream').Transform;
const log = require('winston');

class LicenseValidator extends Transform {
	constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, calllback) {
		log.debug({op:'_transform', length:chunk.length, encoding});
		this.process(chunk, encoding);
    calllback();
  }

	_flush(callback) {
		if (this.unprocessed) {
			log.debug({op:'flush', msg:'unprocessed data exists', size:this.unprocessed.length});
			this.extractWords(this.unprocessed);
		}
		callback();
	}
};
