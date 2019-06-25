const db = require('../db');

module.exports = db.defineModel('User', {
	id: db.ID,
	account: db.STRING(255),
	password: db.STRING(255),
	token: db.STRING(255),
	level: db.INTEGER(11),
	name: db.STRING(255)
});