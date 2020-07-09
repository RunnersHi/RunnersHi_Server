const pool = require('../models/pool');
//const { throw ,} = require('../config/database');

const moment = require("../modules/moment");

const record = {

  winner: async () => {
    //##해당 달, 해당 연도 포함하는 WHERE 문 포함해야함.#############!!! 해결해야해!
    //승만 볼게 아니라 패도 봐야한다...!
    //log_visiablity
    //WHERE u.log_visibility = 1
    const query = 
    `SELECT 
      u.nickname, u.image, 
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
 
    const data = await pool.queryParam(query);

    if(data.length == 0) {
      return {code : "NO_DATA", result : {}};
    } else {
      return {code : "WINNER_SUCCESS", result : data};
    }
  },

  loser: async () => {
    //##해당 달, 해당 연도 포함하는 WHERE 문 포함해야함.#############!!! 해결해야해!
    //패만 볼게 아니라 승도 봐야한다...!
    //AND u.log_visibility = 1
    const query = 
    `SELECT 
     u.nickname, u.image, 
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
     
    const data = await pool.queryParam(query);

    if(data.length == 0) {
      return {code : "NO_DATA", result : {}};
    } else {
      return {code : "LOSER_SUCCESS", result : data};
    }
  },

  runner: async () => {

    //##해당 달, 해당 연도 포함하는 WHERE 문 포함해야함.#############!!! 해결해야해!
    //WHERE u.log_visibility = 1
    const query = 
    `SELECT 
    u.nickname, u.image, 
    SUM(r.distance) as sum, 
    SUBSTR(r.created_time, 1, 4) as year, 
    MONTH(r.created_time) as month,
    MONTH(NOW()) as current_month,
    YEAR(NOW()) as current_year
    FROM user u 
    LEFT JOIN run r ON u.user_idx = r.user_idx
    GROUP BY u.user_idx
    HAVING sum IS NOT NULL AND year = current_year AND month = current_month
    ORDER BY sum DESC 
    limit 10
    `;
    
    const data = await pool.queryParam(query);

    //##data는 여러 개의 배열??? 이 들어간다.
    //##하고 싶은 것 --> 칼럼 중, 사용할 것만(보내줘야 할 것만) 담아서 보내주고 싶다. 

    // const final_data = [];

    // for(var item in data) {
    //   final_data.push(

    //   );
    // }

    if(data.length == 0) {
      return {code : "NO_DATA", result : {}};
    } else {
      return {code : "RUNNER_SUCCESS", result : data};
    }
  },

  getDetailProfile: async(id) => {
    
    const query = 
    `SELECT u.nickname, u.image, u.level, u.badge,
    COUNT(IF(r.result = 0, 1, null)) as win, 
    COUNT(IF(r.result = 1, 1, null)) as lose
    FROM user u 
    LEFT JOIN run r ON u.user_idx = r.user_idx
    WHERE u.user_idx = "${id}"
    `;

    const data = await pool.queryParam(query);
    console.log(data);

    if(data.length == 0) {
      return {code : "NO_DATA", result : {}};
    } else {
      return {code : "RUNNER_DETAIL_PROFILE_SUCCESS", result : data[0]};
    }
  }

};

module.exports = record;