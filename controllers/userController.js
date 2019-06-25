//const model = require('../model');
const User = require('../models/User');
const APIError = require('../rest').APIError;
const uuid = require('node-uuid');

module.exports = {
	/* 
	 * 登录接口
	 * @author Jason
	 * @params <String>account 账号; <String>password 密码
	 */
	'POST /api/user_doLogin': async (ctx, next) => {
		let	account = ctx.request.body.account,
			password = ctx.request.body.password;
		var result = await User.findAll({
			where: {account: account}
		});
		if(result.length > 0){ //存在此账号，判断密码是否正确
			if(result[0].password === password){
				ctx.rest(result[0]);
			}else{
				throw new APIError('account:password_error', '密码错误！');
			}
		}else{ // 没有此账号
			throw new APIError('account:not_found', '账号不存在！');
		}
	},
	/* 
	 * 创建、更新账号接口
	 * @author Jason
	 * @params <String>account 账号; <String>password 密码; <String>name 用户名; <Int>level 级别;
	 */
	'POST /api/user_doUserAU': async (ctx, next) => {
		let id = ctx.request.body.id || '';
		if(id){ //修改操作
			var target = await User.findByPk(id);
			for(let key in ctx.request.body){
				if('execPassword' !== key){
					target[key] = ctx.request.body[key];
				}
			}
			let user = await target.save();
			ctx.rest(user);
		}else{ //新增操作
			let {execPassword, ...userModel} = ctx.request.body;
			userModel.token = uuid.v4().replace(/-/g,''); //创建账号时添加token
			let user = await User.create(userModel);
			if(user){
				ctx.rest(user);
			}else{
				throw new APIError('user:create_error', '创建账号失败！');
			}
		}
	},
	/* 
	 * 查询账号接口
	 * @author Jason
	 */
	'POST /api/user_doPageFindAll': async (ctx, next) => {
		let page = parseInt(ctx.request.body.page),
			count = parseInt(ctx.request.body.count);
		var users = await User.findAndCountAll({
			limit: count,
			offset: (page - 1) * count,
			order: [
				['updatedAt', 'DESC']
			]
		});
		ctx.rest({
			count: users.count,
			data: users.rows
		});
	},
	// 根据id查询账号信息
	'POST /api/user_doGetInfo': async (ctx, next) => {
		let id = ctx.request.body.id;
		var userInfo = await User.findByPk(id);
		if(userInfo){
			ctx.rest(userInfo);
		}else{
			throw new APIError('user:not_found', '没有找到此账号！');
		}
	},
	/* 
	 * 删除账号接口
	 * @author Jason
	 */
	'POST /api/user_doDelete': async (ctx, next) => {
		let id = ctx.request.body.id;
		
		var userDel = await User.destroy({
			where: {id: id}
		});
		if(userDel){
			ctx.rest(1);
		}else{
			throw new APIError('user:not_found', '没有找到此账号！');
		}
	}
};