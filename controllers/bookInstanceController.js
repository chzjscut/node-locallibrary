const model = require('../model');
let Book = model.Book,
	BookInstance = model.BookInstance;
const APIError = require('../rest').APIError;

module.exports = {
	// 查询所有副本
	'POST /api/bookInstance_doPageFindAll': async (ctx, next) => {
		let page = parseInt(ctx.request.body.page),
			count = parseInt(ctx.request.body.count);
		var bookInstances = await BookInstance.findAndCountAll({
			attributes: ['BookInstance.*','Book.name'],
			include: [{
				model: Book,
				attributes: [],
			}],
			raw:true,
			limit: count,
			offset: (page - 1) * count,
			order: [
				['updatedAt', 'DESC']
			]
		});
		ctx.rest({
			count: bookInstances.count,
			data: bookInstances.rows
		});
	},
	// 根据图书id查询其所有副本
	'POST /api/bookInstance_doPageByBookId': async (ctx, next) => {
		let bookId = ctx.request.body.bookId,
		    page = parseInt(ctx.request.body.page),
			count = parseInt(ctx.request.body.count);
		var bookInstances = await BookInstance.findAndCountAll({
			attributes: ['BookInstance.*','Book.name'],
			where: {bookId: bookId},
			include: [{
				model: Book,
				where: {id: bookId},
				attributes: [],
			}],
			raw:true,
			limit: count,
			offset: (page - 1) * count,
			order: [
				['updatedAt', 'DESC']
			]
		});
		ctx.rest({
			count: bookInstances.count,
			data: bookInstances.rows
		});
	},
	// 获取某个副本相关信息(关联Book表)
	'POST /api/bookInstance_doGetInfo': async (ctx, next) => {
		let id = ctx.request.body.id;
		var bookInstanceInfo = await BookInstance.findOne({
			where: {
				id: id
			},
			attributes: ['BookInstance.*','Book.name','Book.author'],
			include: [{
				model: Book,
				attributes: [],
			}],
			raw:true
		});
		if(bookInstanceInfo){
			ctx.rest(bookInstanceInfo);
		}else{
			throw new APIError('bookInstance:not_found', '没有找到此副本！');
		}
	},
	// 创建、修改副本
	'POST /api/bookInstance_doBookInstanceAU': async (ctx, next) => {
		let id = ctx.request.body.id || '';
		if(id){ //修改操作
			var target = await BookInstance.findByPk(id);
			for(let key in ctx.request.body){
				target[key] = ctx.request.body[key];
			}
			let bookInstance = await target.save();
			ctx.rest(bookInstance);
		}else{ //新增操作
			ctx.request.body.due_back = ctx.request.body.due_back || Date.now();
			let bookInstance = await BookInstance.create(ctx.request.body);
			if(bookInstance){
				ctx.rest(bookInstance);
			}else{
				throw new APIError('bookInstance:create_error', '添加副本失败！');
			}
		}
	},
	// 修改副本
	'POST /api/bookInstance_doUpdate': async (ctx, next) => {
		
		
		
		/* let id = ctx.request.body.id,
		    bookInstanceModel = {
				book: ctx.request.body.book,
				imprint: ctx.request.body.imprint,
				status: ctx.request.body.status,
				due_back: ctx.request.body.due_back || Date.now()
			};
		try{
			var bookInstance = await BookInstance.update(bookInstanceModel, {
				where: {id: id}
			});
			ctx.rest(bookInstance);
		}catch(e){
			//TODO handle the exception
			throw new APIError('bookInstance:update_error', '更新副本失败！');
		} */
	},
	// 删除副本
	'POST /api/bookInstance_doDelete': async (ctx, next) => {
		let id = ctx.request.body.id;
		var bookInstanceDel = await BookInstance.destroy({
			where: {id: id}
		});
		if(bookInstanceDel){
			ctx.rest(1);
		}else{
			throw new APIError('bookInstance:delete_error', '删除副本失败！');
		}
	},
};