const db = require('../db');
const Book = require('./Book.js');

module.exports = db.defineModel('BookInstance', {
	id: db.ID,
	bookId: { // 书名，关联Book表
		type: db.ID,
		references: {
			// 引用Book模型
			model: Book,
			
			// 连接模型的列表
			key: 'id'
		}
	},
	imprint: db.STRING(255), // 出版社
	status: { // 状态：'空闲中', '维护中', '已借出'
		type: db.STRING(50),
		isIn: [['available', 'maintenance', 'loaned']]
	},
	due_back: { // 归还日期
		type: db.DATE,
		defaultValue: db.NOW
	}
});