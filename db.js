//使用ORM框架sequelize操作数据库
const Sequelize = require('sequelize');
const uuid = require('node-uuid');

const config = require('./config');

console.log('init sequelize...');

function generateId() {
    return uuid.v1().replace(/-/g,'');
}

var sequelize = new Sequelize(config.database, config.user, config.password, {
	host: config.host,
	dialect: config.dialect,
	pool: {
		max: 5,
		min: 0,
		idle: 10000
	}
});

const ID_TYPE = Sequelize.STRING(50);

function defineModel(name, attributes){
	var attrs = {};
	for(let key in attributes){
		let value = attributes[key];
		if(typeof value === 'object' && value['type']){
			value.allowNull = value.allowNull || false;
			attrs[key] = value;
		}else{
			attrs[key] = {
				type: value,
				allowNull: false
			};
		}
	}
	attrs.id = {
		type: ID_TYPE,
		primaryKey: true
	};
	attrs.createdAt = {
		type: Sequelize.BIGINT,
		allowNull: false
	};
	attrs.updatedAt = {
		type: Sequelize.BIGINT,
		allowNull: false
	};
	attrs.version = {
		type: Sequelize.BIGINT,
		allowNull: false
	};
	console.log('model defined for table: ' + name + '\n' + JSON.stringify(attrs, function(k, v){
		if(k === 'type'){
			for(let key in Sequelize){
				if(key === 'ABSTRACT' || key === 'NUMBER'){
					continue;
				}
				let dbType = Sequelize[key];
				if(typeof dbType === 'function'){
					if(v instanceof dbType){
						if(v._length){
							return `${dbType.key}(${v._length})`;
						}
						return dbType.key;
					}
					if(v === dbType){
						return dbType.key;
					}
				}
			}
		}
		return v;
	}, ' '));
	
	return sequelize.define(name, attrs, {
		tableName: name,
		timestamps: false,
		freezeTableName: true,
		hooks: {
			beforeValidate: function(obj){
				console.log('hook');
				let now = Date.now();
				if(obj.isNewRecord){
					console.log('will create entity...' + obj);
					if(!obj.id){
						obj.id = generateId();
					}
					obj.createdAt = now;
                    obj.updatedAt = now;
                    obj.version = 0;
				}else{
					console.log('will update entity...');
					obj.updatedAt = now;
                    obj.version++;
				}
			},
		}
	});
}

const TYPES = ['STRING', 'INTEGER', 'BIGINT', 'TEXT', 'DOUBLE', 'DATEONLY', 'DATE', 'BOOLEAN'];

var exp = {
	defineModel: defineModel,
	sync: () => {
		// only allow create ddl in non-production environment:
		if(process.env.NODE_ENV !== 'production'){
			sequelize.sync();
			//sequelize.sync({ force: true });
		}else{
			throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.');
		}
	}
};

for(let type of TYPES){
	exp[type] = Sequelize[type];
}

exp.ID = ID_TYPE;
exp.generateId = generateId;

// 日期默认值：当前日期
exp.NOW = sequelize.NOW;

module.exports = exp;
