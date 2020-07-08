const pool = require('../modules/pool');
//const { throw ,} = require('../config/database');

const moment = require("../modules/moment");

const yearCurrent = moment.currentYear();

const record = {

  winner: async () => {
        //##해당 달, 해당 연도 포함하는 WHERE 문 포함해야함.#############!!! 해결해야해!
        //승만 볼게 아니라 패도 봐야한다...!
        const query = 
        `SELECT 
        u.user_idx, u.nickname, u.image, 
        COUNT(IF(r.result = 0, 1, null)) as win, 
        COUNT(IF(r.result = 1, 1, null)) as lose, 
        SUBSTR(r.created_time, 1, 4) as year
        FROM user u 
        LEFT JOIN run r ON u.user_idx = r.user_idx
        GROUP BY u.user_idx
        HAVING win != 0 AND lose != 0
        ORDER BY win DESC 
        limit 10
        `;
        try {
          const result = await pool.queryParam(query);
          console.log(result);
          return result;
        } catch (err) {
          if (err.errno == 1062) {
            console.log("runner ERROR : ", err.errno, err.code);
            return -1;
          }
          console.log("runner ERROR : ", err);
          throw err;
       }
  },

  loser: async () => {
        //##해당 달, 해당 연도 포함하는 WHERE 문 포함해야함.#############!!! 해결해야해!
        //패만 볼게 아니라 승도 봐야한다...!
        const query = 
        `SELECT 
        u.user_idx, u.nickname, u.image, 
        COUNT(IF(r.result = 0, 1, null)) as win, 
        COUNT(IF(r.result = 1, 1, null)) as lose, 
        SUBSTR(r.created_time, 1, 4) as year
        FROM user u 
        LEFT JOIN run r ON u.user_idx = r.user_idx
        GROUP BY u.user_idx
        HAVING win != 0 AND lose != 0
        ORDER BY lose DESC 
        limit 10
        `;
     
        try {
          const result = await pool.queryParam(query);
          console.log(result);
          return result;
        } catch (err) {
          if (err.errno == 1062) {
            console.log("runner ERROR : ", err.errno, err.code);
            return -1;
          }
          console.log("runner ERROR : ", err);
          throw err;
        }
  },

  runner: async () => {

    //##해당 달, 해당 연도 포함하는 WHERE 문 포함해야함.#############!!! 해결해야해!
    const query = 
    `SELECT 
    u.user_idx, u.nickname, u.image, 
    SUM(r.distance) as sum, 
    SUBSTR(r.created_time, 1, 4) as year
    FROM user u 
    LEFT JOIN run r ON u.user_idx = r.user_idx
    GROUP BY u.user_idx
    HAVING sum IS NOT NULL AND year = '2020'
    ORDER BY sum DESC 
    limit 10
    `;
 
    try {
      const result = await pool.queryParam(query);
      console.log(result);
      return result;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("runner ERROR : ", err.errno, err.code);
        return -1;
      }
      console.log("runner ERROR : ", err);
      throw err;
   }
  }
};

module.exports = record;