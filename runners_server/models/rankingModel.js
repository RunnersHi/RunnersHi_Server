const pool = require('../models/pool');

const ranking = {

  winner: async () => {
    const query = 
    `SELECT 
      u.nickname, u.image, u.user_idx, u.log_visibility,
      COUNT(IF(r.result = 1, 1, null) || IF(r.result = 5, 1, null)) as win, 
      COUNT(IF(r.result = 2, 0, null)) as lose, 
      YEAR(r.created_time) as year,
      MONTH(r.created_time) as month,
      MONTH(NOW()) as current_month,
      YEAR(NOW()) as current_year
    FROM user u 
    LEFT JOIN run r ON u.user_idx = r.user_idx
    WHERE 
      u.log_visibility =1
    GROUP BY 
      u.user_idx
    HAVING 
      year = current_year AND month = current_month
    ORDER BY win DESC, lose ASC
    limit 10
      `;
 
    const data = await pool.queryParam(query);

    if(data.length === 0) {
      return {code : "SUCCESS_BUT_NO_DATA", result : {}};
    }
    return data;
  },

  loser: async () => {
    const query = 
    `SELECT 
      u.nickname, u.image, u.user_idx, u.log_visibility,
      COUNT(IF(r.result = 1, 1, null) || IF(r.result = 5, 1, null)) as win, 
      COUNT(IF(r.result = 2, 1, null)) as lose, 
      YEAR(r.created_time) as year,
      MONTH(r.created_time) as month,
      MONTH(NOW()) as current_month,
      YEAR(NOW()) as current_year
    FROM 
      user u 
    LEFT JOIN run r ON u.user_idx = r.user_idx
    WHERE 
      u.log_visibility =1
    GROUP BY 
      u.user_idx
    HAVING 
      year = current_year AND month = current_month
    ORDER BY lose DESC, win ASC
    limit 10
    `;
    const data = await pool.queryParam(query);

    if(data.length === 0) {
      return {code : "SUCCESS_BUT_NO_DATA", result : {}};
    }

    return data;
  },

  runner: async () => {
    const query = 
    `
    SELECT 
      u.nickname, u.image, u.user_idx, u.log_visibility,
      SUM(r.distance) as sum,
      SUM(r.time) as sum_time,
      SUBSTR(r.created_time, 1, 4) as year, 
      MONTH(r.created_time) as month,
      MONTH(NOW()) as current_month,
      YEAR(NOW()) as current_year
    FROM 
     user u 
    LEFT JOIN run r ON u.user_idx = r.user_idx
    WHERE 
      u.log_visibility=1
    GROUP BY 
      u.user_idx
    HAVING sum IS NOT NULL AND year = current_year AND month = current_month
    ORDER BY sum DESC, sum_time ASC
    limit 10
    `;
    
    const data = await pool.queryParam(query);

    if(data.length === 0) {
      return {code : "SUCCESS_BUT_NO_DATA", result : {}};
    } 
    return data;
  },

  getDetailProfile: async(id) => {
    const query = 
    `
    SELECT u.nickname, u.image, u.level,
    COUNT(IF(r.result = 1, 1, null) || IF(r.result = 5, 1, null)) as win,
    COUNT(IF(r.result = 2, 1, null)) as lose
    FROM user u 
    LEFT JOIN run r ON u.user_idx = r.user_idx
    WHERE u.user_idx = "${id}"
    `;
    const data = await pool.queryParam(query);

    if(data.length === 0) {
      return "WRONG_PARAM";
    } 
    return data[0];
  }
};

module.exports = ranking;