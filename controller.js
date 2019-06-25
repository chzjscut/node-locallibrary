const fs = require('fs');
const router = require('koa-router')();

function addMapping(router, mapping){
	for(var url in mapping){
		if(url.startsWith('GET ')){
			var path = url.substring(4);
			router.get(path, mapping[url]);
		}else if(url.startsWith('POST ')){
			var path = url.substring(5);
			router.post(path,mapping[url]);
		}else{
			// 无效的URL:
	        console.log(`invalid URL: ${url}`);
		}
	}
}

function addControllers(router, dir){
	// 先导入fs模块，然后用readdirSync列出文件
	// 这里可以用sync是因为启动时只运行一次，不存在性能问题:
	var files = fs.readdirSync(__dirname + '/' + dir);
	// 过滤出.js文件:
	var js_files = files.filter((f)=>{
	    return f.endsWith('.js');
	});
	
	// 处理每个js文件:
	for(var f of js_files){
		console.log(`process controller: ${f}...`);
		// 导入js文件:
		let mapping = require(__dirname + '/' + dir + '/' + f);
		addMapping(router, mapping);
	}
}

module.exports = function(dir){
	let controller_dir = dir || 'controllers'; // 如果不传参数，扫描目录默认为'controllers'
	addControllers(router, controller_dir);
	return router.routes();
};