const pool = require('./pool');
//const { throw ,} = require('../config/database');
const table = 'user';

const record = {

  getAllRecords: async (id) => {

    const query = 
    `SELECT r.created_time, r.distance, r.time, r.run_idx, r.result, r.game_idx
    FROM user u, run r
    WHERE u.user_idx = "${id}" AND u.user_idx = r.user_idx 
    ORDER BY r.run_idx;`

    const data = await pool.queryParam(query);

    console.log(data[0].game_idx);

    if(data.length === 0) {
      //## 데이터가 없을 때 아무것도 안보내줌. 수정필요
      return {code: "SUCCESS_BUT_NO_DATA", result: {}};
    } else {
      return {code: "RECORD_ALL_SUCCESS", result: data};
    }
  },

  getDetailRecord: async(id) => {
    //쿼리는 다시 짜야함
    const query = 
    `SELECT r.created_time, r.end_time, r.distance, r.time 
    FROM run r
    WHERE u.user_idx = "${id}" AND u.user_idx = r.user_idx 
    ORDER BY r.run_idx;`

    const data = await pool.queryParam(query);

    if(data.length === 0) {
      //## 데이터가 없을 때 아무것도 안보내줌. 수정필요
      return {code: "SUCCESS_BUT_NO_DATA", result: {}};
    } else {
      return {code: "RECORD_DETAIL_SUCCESS", result: data};
    }
   
  },

  getBadge: async(id) => {
    const query = `SELECT badge FROM ${table} WHERE user_idx = "${id}"`;

    const data = await pool.queryParam(query);

    if(data.length === 0) {
      //## 데이터가 없을 때 아무것도 안보내줌. 수정필요
      return {code: "SUCCESS_BUT_NO_DATA", result: {}};
    } else {
      return {code: "RECORD_ALL_SUCCESS", result: data};
    }
  },

  //최근기록조회 :id
  getUserRecentRecord: async(id) => {

    //가장 큰 
    const query = 
    `SELECT r.distance, r.time, r.result, (r.time * 1000)/r.distance as pace
    FROM run r
    WHERE r.user_idx = "${id}"
    ORDER BY r.run_idx DESC 
    limit 1;`

    const data = await pool.queryParam(query);

    if(data.length === 0) {
      //## 데이터가 없을 때 204 안보내줌. 수정필요
      return {code: "SUCCESS_BUT_NO_DATA", result: {}};
    } else {
      return {code: "GET_RECENT_RECORD_SUCCESS", result: data};
    }
  },

  getUserIdxRunIdxRecord: async(user_idx, run_idx) => {

    const query = 
    `SELECT r.distance, r.time, r.result, (r.time * 1000)/r.distance as pace
    FROM run r
    WHERE r.user_idx = "${user_idx}" 
    AND r.run_idx = "${run_idx}";`

    const data = await pool.queryParam(query);

    if(data.length === 0) {
      //## 데이터가 없을 때 204 안보내줌. 수정필요
      return {code: "SUCCESS_BUT_NO_DATA", result: {}};
    } else {
      return {code: "USER_RECORD_SUCCESS", result: data};
    }

  },
  //상대방 기록보기
  getOpponentRecord: async(user_idx, game_idx) => {
     //가장 큰 
     const query = 
     `SELECT r.distance, r.time, r.result, (r.time * 1000)/r.distance as pace
     FROM run r
     WHERE r.game_idx = "${game_idx}"
     AND r.user_idx != "${user_idx}";`

     const query_nickname = `SELECT nickname FROM user WHERE user_idx = "${user_idx}";`
 
     const data = await pool.queryParam(query);
     const user_nickname = await pool.queryParam(query_nickname);

     const final_data = {
       nickname: user_nickname[0].nickname,
       distance: data[0].distance,
       time: data[0].time,
       result: data[0].result,
       pace: data[0].pace
     }

     console.log(final_data);
 
     if(final_data.length === 0) {
       //## 데이터가 없을 때 204 안보내줌. 수정필요
       return {code: "OPPONENT_RECORD_SUCCESS", result: {}};
     } else {
       return {code: "USER_RECORD_SUCCESS", result: final_data};
     }
  }
};

module.exports = record;