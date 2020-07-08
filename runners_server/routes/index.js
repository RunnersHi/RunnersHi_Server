const router = require("express").Router();

const fs = require("fs");
const list = fs
    .readdirSync(__dirname)
    .filter(dir => !dir.match(/(^\.)|index/i));

module.exports = (app) => {
  for (let ctrl of list) {
    app.use(`/${ctrl}`.substr(0, ctrl.length - 2), require(`./${ctrl}`)(router));
  }
};
