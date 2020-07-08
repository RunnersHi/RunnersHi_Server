const mysql = require('promise-mysql');
const DBConfig = require("./../config/DBConfig.json");
const poolPromise = mysql.createPool(DBConfig);


module.exports = {
  queryParam: async (query) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("query param try try try try ");
        const pool = await poolPromise;
        console.log("query param pool");
        const connection = await pool.getConnection();
        try {
          const result = await connection.query(query);
          pool.releaseConnection(connection);
          resolve(result);
        } catch (err) {
          pool.releaseConnection(connection);
          reject(err);
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  queryParamArr: async (query, value) => {
    return new Promise(async (resolve, reject) => {
      try {
        const pool = await poolPromise;
        const connection = await pool.getConnection();
        try {
          //## result에는 어떤 값이 들어가는지?
          const result = await connection.query(query, value);
          pool.releaseConnection(connection);
          resolve(result);
        } catch (err) {
          pool.releaseConnection(connection);
          reject(err);
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  Transaction: async (...args) => {
    return new Promise(async (resolve, reject) => {
      try {
        const pool = await poolPromise;
        const connection = await pool.getConnection();
        try {
          await connection.beginTransaction();
          args.forEach(async (it) => await it(connection));
          await connection.commit();
          pool.releaseConnection(connection);
          resolve(result);
        } catch (err) {
          await connection.rollback();
          pool.releaseConnection(connection);
          reject(err);
        }
      } catch (err) {
        reject(err);
      }
    });
  },
};