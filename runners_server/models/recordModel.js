const pool = require('./pool');
//const { throw ,} = require('../config/database');
const table = 'user';

const record = {

  getAllRecords: async (id) => {
    const query = `SELECT run.created_time, user.user_idx, run.distance, run.time, run.run_idx FROM ${table}, run WHERE ${table}.id = "${id}" AND ${table}.user_idx = run.user_idx ORDER BY run.run_idx;`
    //console.log("쿼리" + id);
    //const query = `SELECT * FROM ${table} WHERE id = "${id}"`;
    try {
      const result = await pool.queryParam(query);
      console.log(result);
      return result;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getAllRecords ERROR : ", err.errno, err.code);
        return -1;
      }
      console.log("getAllRecords ERROR : ", err);
      throw err;
    }
  },
  getDetailRecord: async(id) => {
    //쿼리는 다시 짜야함
    const query = `SELECT run.created_time, run.end_time, run.distance, run.time,  FROM ${table}, run WHERE ${table}.id = "${id}" AND ${table}.user_idx = run.user_idx ORDER BY run.run_idx;`
   
    //const query = `SELECT * FROM ${table} WHERE id = ${id}`;
    try {
      const result = await pool.queryParamArr(query);

      
      //pace를 구해야함. result에 있는 값

      return result;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getDetailRecord ERROR : ", err.errno, err.code);
        return -1;
      }
      console.log("getDetailRecord ERROR : ", err);
      throw err;
    }
  },
  getBadge: async(id) => {
    const query = `SELECT badge FROM ${table} WHERE id = "${id}"`;

    try {
      const result = await pool.queryParamArr(query);
      return result;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getBadge ERROR : ", err.errno, err.code);
        return -1;
      }
      console.log("getBadge ERROR : ", err);
      throw err;
    }
  }
};

module.exports = record;