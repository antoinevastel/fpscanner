//require("babel-polyfill");

// TODO add canvas bis in auxiliary function
const fpscanner = (function () {

  const fpCollect = require('./collect.js');
  const scan = require('./scan.js');

  return {
    collect: fpCollect,
    scan: scan,
 };

})();

module.exports = fpscanner;
