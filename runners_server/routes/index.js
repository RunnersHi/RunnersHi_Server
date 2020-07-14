const fs = require("fs");
const iconv = require('iconv-lite');
const list = fs
    .readdirSync(__dirname)
    .filter(dir => !dir.match(/(^\.)|index/i));

module.exports = (app) => {
  let code = iconv.encode(new Buffer("밍"), "EUC-KR");
  let result = iconv.decode(Buffer.from(code), "EUC-KR");
  console.log(code);
  console.log(result);
  for (let ctrl of list) {
    app.use(`/${ctrl}`.substr(0, ctrl.length - 2), require(`./${ctrl}`)(require("express").Router()));
  }
};