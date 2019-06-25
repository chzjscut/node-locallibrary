const db = require('../db');

module.exports = db.defineModel('Book', {
	id: db.ID,
	name: db.STRING(100),
	author: db.STRING(100),
	summary: db.STRING(1000),
	isbn: db.STRING(20) // '国际标准图书编号', 这里假定每本书的isbn相同（即使出版社不同）
});