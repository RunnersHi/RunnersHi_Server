const pool = require('../modules/pool');
//const { throw ,} = require('../config/database');
const table = 'user';

const user = {

  getAllRecords: async () => {
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

module.exports = user;