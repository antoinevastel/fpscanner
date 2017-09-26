require("babel-polyfill");

// TODO separate collect code from scanner code so that scanner can be placed on serverside
// TODO say if attribute needs to be hashed or stored in plain text
const fpscanner = (function () {

  const fpCollect = require('./collect.js');
  const scan = require('./scan.js');

  return {
    collect: fpCollect,
    scan: scan,
 };

})();

module.exports = fpscanner;
