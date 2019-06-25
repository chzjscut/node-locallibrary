module.exports = {
	APIError: function(code, message){
		this.code = code || 'internal:unknown_error';
		this.message = message || '';
	},
	restify: (pathPrefix) => {
		//console.log('restify execute...');
		pathPrefix = pathPrefix || '/api/';
		return async(ctx, next) => {
			console.log(ctx.request.path);
			if(ctx.request.path.startsWith(pathPrefix)){
				console.log(`Process API ${ctx.request.method} ${ctx.request.url}...`);
				ctx.rest = (data) => {
					ctx.response.type = 'application/json';
					// 分页查询统一格式输出
					let count = data.count || '';
					if(count && data.data){
						ctx.response.body = {
							status: 1,
							total: data.count,
							data: data.data
						}
					}else{
						ctx.response.body = {
							data: data,
							status: 1
						};
					}
				}
				try {
					await next();
				} catch(e) {
					console.log('Process API error...');
					//ctx.response.status = 400;
					ctx.response.type = 'application/json';
					ctx.response.body = {
						status: 0,
						code: e.code || 'internal:unknown_error',
                        message: e.message || ''
					};
				}
			}else{
				await next();
			}
		}
	}
};