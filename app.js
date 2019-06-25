const Koa = require('koa');
//处理post请求
const bodyParser = require('koa-bodyparser');
//const mysql = require('mysql');
//const db = require('./db');
const controller = require('./controller');
const rest = require('./rest');
/* const model = require('./model');
(async () => {
	model.sync();
})(); */
const app = new Koa();

// log request URL:
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});

app.use(bodyParser());
app.use(async (ctx, next) => {
    //设置跨域访问
    ctx.set("Content-Type", "application/json;charset=UTF-8");
    ctx.set("Access-Control-Allow-Origin", "*");
    //ctx.set("Access-Control-Allow-Headers", "x-requested-with, accept, origin, content-type");

	await next();
});
// bind .rest() for ctx:
app.use(rest.restify());
app.use(controller());

app.listen(3000);
console.log('app started at port 3000...');