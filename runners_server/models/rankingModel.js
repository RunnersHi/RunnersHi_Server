const pool = require('../models/pool');
//const { throw ,} = require('../config/database');

const record = {

  winner: async () => {
    //승만 볼게 아니라 패도 봐야한다...!
    const query = 
    `SELECT 
      u.nickname, u.image, u.user_idx, u.log_visibility,
      COUNT(IF(r.result = 1, 2, null)) as win, 
      COUNT(IF(r.result = 2, 1, null)) as lose, 
      YEAR(r.created_time) as year,
      MONTH(r.created_time) as month,
      MONTH(NOW()) as current_month,
      YEAR(NOW()) as current_year
      FROM user u 
      LEFT JOIN run r ON u.user_idx = r.user_idx
      WHERE u.log_visibility =1
      GROUP BY u.user_idx
      HAVING year = current_year AND month = current_month
      ORDER BY win DESC 
      limit 10
      `;
 
    const data = await pool.queryParam(query);

    if(data.length == 0) {
      return {code : "SUCCESS_BUT_NO_DATA", result : {}};
    }

    const final_data = [];

    for(let i = 0; i < data.length; i++){

      if(data[i].win + data[i].lose != 0) {
        final_data.push( {
          nickname: data[i].nickname,
          image: data[i].image,
          user_idx: data[i].user_idx,
          win: data[i].win,
          lose: data[i].lose
        });
      }
    }

    return {code : "WINNER_SUCCESS", result : final_data};
    
  },

  loser: async () => {
    //패만 볼게 아니라 승도 봐야한다...!
    const query = 
    `SELECT 
     u.nickname, u.image, u.user_idx, u.log_visibility,
    COUNT(IF(r.result = 1, 2, null)) as win, 
    COUNT(IF(r.result = 2, 1, null)) as lose, 
    YEAR(r.created_time) as year,
    MONTH(r.created_time) as month,
    MONTH(NOW()) as current_month,
    YEAR(NOW()) as current_year
    FROM user u 
    LEFT JOIN run r ON u.user_idx = r.user_idx
    WHERE u.log_visibility =1
    GROUP BY u.user_idx
    HAVING year = current_year AND month = current_month
    ORDER BY lose DESC 
    limit 10
    `;

    const data = await pool.queryParam(query);
    const final_data = [];

    if(data.length == 0) {
      return {code : "SUCCESS_BUT_NO_DATA", result : {}};
    }

    for(let i = 0; i < data.length; i++){

      if(data[i].win + data[i].lose != 0) {
        final_data.push( {
          nickname: data[i].nickname,
          image: data[i].image,
          user_idx: data[i].user_idx,
          win: data[i].win,
          lose: data[i].lose
        });
      }
    }

    return {code : "LOSER_SUCCESS", result : final_data};
    
  },

  runner: async () => {
    
    const query = 
    `SELECT 
    u.nickname, u.image, u.user_idx, u.log_visibility,
    SUM(r.distance) as sum, 
    SUBSTR(r.created_time, 1, 4) as year, 
    MONTH(r.created_time) as month,
    MONTH(NOW()) as current_month,
    YEAR(NOW()) as current_year
    FROM user u 
    LEFT JOIN run r ON u.user_idx = r.user_idx
    WHERE u.log_visibility=1
    GROUP BY u.user_idx
    HAVING sum IS NOT NULL AND year = current_year AND month = current_month
    ORDER BY sum DESC 
    limit 10
    `;
    
    const data = await pool.queryParam(query);
    const final_data = [];

    if(data.length == 0) {
      return {code : "SUCCESS_BUT_NO_DATA", result : {}};
    } 

    for(let i = 0; i < data.length; i++){
    
      final_data.push( {
        nickname: data[i].nickname,
        image: data[i].image,
        user_idx: data[i].user_idx,
        distance_sum: data[i].sum
      });
    }
   
    return {code : "RUNNER_SUCCESS", result : final_data};
  },

  getDetailProfile: async(id) => {
    
    const query = 
    `SELECT u.nickname, u.image, u.level,
    COUNT(IF(r.result = 1, 2, null)) as win,
    COUNT(IF(r.result = 2, 1, null)) as lose
    FROM user u 
    LEFT JOIN run r ON u.user_idx = r.user_idx
    WHERE u.user_idx = "${id}"
    `;

    const data = await pool.queryParam(query);

    if(data.length == 0) {
      return {code : "SUCCESS_BUT_NO_DATA", result : {}};
    } else {
      return data[0];
      //return {code : "RUNNER_DETAIL_PROFILE_SUCCESS", result : data[0]};
    }
  }

};

module.exports = record;