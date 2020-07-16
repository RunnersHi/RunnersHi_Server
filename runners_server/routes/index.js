const fs = require("fs");
const list = fs
    .readdirSync(__dirname)
    .filter(dir => !dir.match(/(^\.)|index/i));

module.exports = (app) => {
  console.log(code);
  console.log(result);
  for (let ctrl of list) {
    app.use(`/${ctrl}`.substr(0, ctrl.length - 2), require(`./${ctrl}`)(require("express").Router()));
  }
};