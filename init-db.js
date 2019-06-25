/* require('babel-core/register')({
    presets: ['stage-3']
}); */

const model = require('./db.js');
model.sync();

console.log('init db ok.');
process.exit(0);