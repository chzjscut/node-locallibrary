const db = require('../db');

module.exports = db.defineModel('Genre', {
	id: db.ID,
	name: db.STRING(100), // 体裁，种类
});