// Wrapper para evitar el bug de Node.js 24 con ESM loader en Windows
// El archivo real está en metro.config.cjs
module.exports = require('./metro.config.cjs');
