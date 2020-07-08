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
  getDetailRecord: async() => {
    //쿼리는 다시 짜야함
    const query = `SELECT * FROM ${table} WHERE id = ${id}`;
    try {
      const result = await pool.queryParamArr(query);
      return result;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getAllRecords ERROR : ", err.errno, err.code);
        return -1;
      }
      console.log("getAllRecords ERROR : ", err);
      throw err;
    }
  }
};

module.exports = record;