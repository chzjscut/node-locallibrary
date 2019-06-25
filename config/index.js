const defaultConfig = './config-default.js';
const prodConfig = './config-prod.js';

const fs = require('fs');

var config = null;

if(process.env.NODE_ENV === 'production'){
	console.log(`Load ${prodConfig}...`);
	config = require(prodConfig);
}else{
	console.log(`Load ${defaultConfig}...`);
	config = require(defaultConfig);
}

module.exports = config;