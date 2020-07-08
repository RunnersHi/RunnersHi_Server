//mysql connection
const mysql = require("mysql");
const DBConfig = require("./../config/DBConfig");
const pool = mysql.createPool(DBConfig);

//cipher
const jwt = require("jsonwebtoken");
const config = require("../config/config");