const model = require('../model');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
let Book = model.Book,
	Genre = model.Genre;
const APIError = require('../rest').APIError;

module.exports = {
	// 新增、修改体裁
	'POST /api/genre_doGenreAU': async (ctx, next) => {
		let id = ctx.request.body.id || '';
		if(id){ //修改操作
			var target = await Genre.findByPk(id);
			target.name = ctx.request.body.name;
			let genre = await target.save();
			ctx.rest(genre);
		}else{ //新增操作
			var genreModel = ctx.request.body;
			let genre = await Genre.create(genreModel);
			if(genre){
				ctx.rest(genre);
			}else{
				throw new APIError('genre:create_error', '添加体裁失败！');
			}
		}
	},
	// 分页查询所有体裁
	'POST /api/genre_doPageFindAll': async (ctx, next) => {
		let page = parseInt(ctx.request.body.page),
			count = parseInt(ctx.request.body.count);
		var genres = await Genre.findAndCountAll({
			limit: count,
			offset: (page - 1) * count,
			order: [
				['updatedAt', 'DESC']
			]
		});
		ctx.rest({
			count: genres.count,
			data: genres.rows
		});
	},
	// 根据id查询体裁信息
	'POST /api/genre_doGetInfo': async (ctx, next) => {
		let id = ctx.request.body.id;
		var genreInfo = await Genre.findByPk(id);
		if(genreInfo){
			ctx.rest(genreInfo);
		}else{
			throw new APIError('genre:not_found', '没有找到此体裁！');
		}
	},
	// 体裁名模糊查询
	'POST /api/genre_doFuzzyQueryByName': async (ctx, next) => {
		let name = ctx.request.body.name;
		var genres = await Genre.findAll({
			attributes: ['id', 'name'],
			where: {
				name: {
					//模糊查询
					[Op.like]: '%' + name + '%'
				}
			}
		});
		ctx.rest(genres);
	},
	// 删除体裁
	'POST /api/genre_doDelete': async (ctx, next) => {
		let id = ctx.request.body.id;
		var genreDel = await Genre.destroy({
			where: {id: id}
		});
		if(genreDel){
			ctx.rest(1);
		}else{
			throw new APIError('genre:not_found', '没有此体裁！');
		}
	},
};