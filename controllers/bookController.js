const model = require('../model');
const APIError = require('../rest').APIError;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
let Book = model.Book,
	BookInstance = model.BookInstance,
	Genre = model.Genre,
	BookGenre = model.BookGenre;
Book.hasMany(BookInstance, {foreignKey: 'bookId'});
BookInstance.belongsTo(Book, {foreignKey: 'bookId'});
Book.belongsToMany(Genre, {as: 'genres', through: 'BookGenre', foreignKey: 'bookId'});
Genre.belongsToMany(Book, {as: 'books', through: 'BookGenre', foreignKey: 'genreId'});

module.exports = {
	// 新增、修改图书
	'POST /api/book_doBookAU': async (ctx, next) => {
		let id = ctx.request.body.id || '';
		if(id){ //修改操作
			var target = await Book.findByPk(id);
			for(let key in ctx.request.body){
				if('genreIds' !== key){
					target[key] = ctx.request.body[key];
				}
			}
			let setGenres = await target.setGenres(ctx.request.body.genreIds);
			let book = await target.save();
			ctx.rest(book);
		}else{ //新增操作
			let {genreIds, ...bookModel} = ctx.request.body;
			let book = await Book.create(bookModel);
			if(book){
				var genres = await Genre.findAll({
					where: {id: genreIds}
				});
				if(genres && genres.length > 0){
					let setGenres = await book.setGenres(genres);
					if(setGenres){
						ctx.rest(book);
					}else{
						throw new APIError('bookGenre:create_error', '添加图书和体裁对应关系失败！');
					}
				}else{
					throw new APIError('genre:not_found', '没有找到对应的体裁！');
				}
			}else{
				throw new APIError('book:create_error', '添加图书失败！');
			}
		}
	},
	// 分页查询所有图书
	'POST /api/book_doPageFindAll': async (ctx, next) => {
		let page = parseInt(ctx.request.body.page),
			count = parseInt(ctx.request.body.count);
		var books = await Book.findAndCountAll({
			include: [{
				model: Genre,
				as: 'genres',
				through: {
					attributes: []
				},
				attributes: ['id','name']
			}],
			limit: count,
			offset: (page - 1) * count,
			order: [
				['updatedAt', 'DESC']
			]
		});
		ctx.rest({
			count: books.count,
			data: books.rows
		});
	},
	// 根据id查询图书信息(关联Genre表:多对多)
	'POST /api/book_doGetInfo': async (ctx, next) => {
		let id = ctx.request.body.id;
		var bookInfo = await Book.findOne({
			where: {id: id},
			include: [{
				model: Genre,
				as: 'genres',
				through: {
					attributes: [],
					where: {bookId: id}
				},
				attributes: ['id', 'name']
			}],
			//raw:true
		});
		if(bookInfo){
			ctx.rest(bookInfo);
		}else{
			throw new APIError('book:not_found', '没有找到此书！');
		}
	},
	// 书名模糊查询
	'POST /api/book_doFuzzyQueryByName': async (ctx, next) => {
		let name = ctx.request.body.name;
		var books = await Book.findAll({
			attributes: ['id', 'name', 'author'],
			where: {
				name: {
					//模糊查询
					[Op.like]: '%' + name + '%'
				}
			}
		});
		ctx.rest(books);
	},
	// 删除图书(同时会删除对应的所有副本和关联表bookGenre的对应记录)
	'POST /api/book_doDelete': async (ctx, next) => {
		let id = ctx.request.body.id;
		
		var bookDel = await Book.destroy({
			where: {id: id},
			/* include: [{
				model: BookInstance,
				where: {bookId: id}
			}] */
		});
		if(bookDel){
			ctx.rest(1);
		}else{
			throw new APIError('book:not_found', '没有找到此书！');
		}
	},
};