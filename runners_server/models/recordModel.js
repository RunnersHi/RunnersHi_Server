const pool = require('./pool');
const table = 'user';

const record = {

  getAllRecords: async (id) => {

    const query = 
    `SELECT SUBSTR(r.created_time, 1, 10) as date, r.distance, r.time, r.run_idx, r.result, r.game_idx
    FROM user u, run r
    WHERE u.user_idx = "${id}" AND u.user_idx = r.user_idx 
    ORDER BY r.run_idx;`

    const data = await pool.queryParam(query);

    if(data.length === 0) {
      return {code: "SUCCESS_BUT_NO_DATA", result: {}};
    } 

    const final = await record.makeArray(data);
    return {code: "RECORD_ALL_SUCCESS", result: final};
  },

  makeArray: async(data) => {
    const final_data = [];

    for(let i = 0; i < data.length; i++){
      if(data[i].result === 1 || data[i].result === 5) {
        result_num = 0;
      } else {
        result_num = 1;
      }
      
      final_data.push( {
        date: data[i].nickname,
        distance: data[i].distance,
        time: data[i].time,
        run_idx: data[i].run_idx,
        result: result_num,
        game_idx: data[i].game_idx,
      });
    }

    return final_data;
  },

  getDetailRecord: async(user_idx, run_idx) => {
   
    const query = 
    `SELECT MONTH(created_time) as month,
    DAY(created_time) as day,
    TIME(created_time) as create_time,
    TIME(end_time) as end_time
    FROM run
    WHERE user_idx = "${user_idx}" AND run_idx = "${run_idx}";`

    const coordinate =  
    `SELECT latitude, longitude 
    From coordinate
    WHERE run_idx =  "${run_idx}";`

    const data = await pool.queryParam(query);
    const coordiData = await pool.queryParam(coordinate);

    if(data.length === 0 || coordiData.length === 0) {
      return {code: "SUCCESS_BUT_NO_DATA", result: {}};
    }

    const real_result = {
      month: data[0].month,
      day: data[0].day,
      start_time: data[0].create_time,
      end_time: data[0].end_time,
      coordinate: coordiData
    }

    return {code: "RECORD_DETAIL_SUCCESS", result: real_result};
   
  },

  getBadge: async(id) => {
    const query = `SELECT badge FROM ${table} WHERE user_idx = "${id}"`;
    const data = await pool.queryParam(query);

    if(data.length === 0) {
      //return "SUCCESS_BUT_NO_DATA";
      return {code: "SUCCESS_BUT_NO_DATA", result: {}};
    }

    let result = {};
    let badge = [];
    let bin = data[0].badge.toString(2);

    for(let i = 0; i < bin.length; i++){
      badge[i] = (bin[i] === '1');
    }

    result.badge = badge;
    return result;
  },

  //최근기록조회 :id
  getUserRecentRecord: async(id) => {

    const query = 
    `SELECT r.distance, r.time, (r.time * 1000)/r.distance as pace,  r.result
    FROM run r
    WHERE r.user_idx = "${id}"
    ORDER BY r.run_idx DESC 
    limit 1;`

    const data = await pool.queryParam(query);

    if(data.length === 0) {
      return {code: "SUCCESS_BUT_NO_DATA", result: {}};
    }
    
    let data_win_lose = 0;
    if(data[0].result === 1 || data[0].result === 5){
      data_win_lose = 1;
    }

    const final_data = {
      distance: data[0].distance,
      time: data[0].time,
      pace: data[0].pace,
      result: data_win_lose
    }

    return {code: "GET_RECENT_RECORD_SUCCESS", result: final_data};
    
  },

  getUserIdxRunIdxRecord: async(user_idx, run_idx) => {

    const query = 
    `SELECT r.distance, r.time, r.result, (r.time * 1000)/r.distance as pace
    FROM run r
    WHERE r.user_idx = "${user_idx}" 
    AND r.run_idx = "${run_idx}";`

    const data = await pool.queryParam(query);

    if(data.length === 0) {
      return {code: "SUCCESS_BUT_NO_DATA", result: {}};
    } else {
      const final_data = {
        distance: data[0].distance,
        time: data[0].time,
        pace: data[0].pace,
        result: data[0].result
      }
      return {code: "USER_RECORD_SUCCESS", result: final_data};
    }

  },
  //상대방 기록보기
  //쿼리문을 2개를 사용해서 접근하는 것이 과연 좋은 방법인가?! --> JOIN을 사용하는 것이 더 좋을까?
  getOpponentRecord: async(user_idx, game_idx) => {
     const query = 
     `SELECT r.distance, r.time, r.result, (r.time * 1000)/r.distance as pace
     FROM run r
     WHERE r.game_idx = "${game_idx}"
     AND r.user_idx != "${user_idx}";`

     const query_nickname = `SELECT nickname FROM user WHERE user_idx = "${user_idx}";`
 
     const data = await pool.queryParam(query);
     const user_nickname = await pool.queryParam(query_nickname);

     if(data.length === 0) {
      return {code: "OPPONENT_RECORD_SUCCESS", result: {}};
    } 

     const final_data = {
       nickname: user_nickname[0].nickname,
       distance: data[0].distance,
       time: data[0].time,
       result: data[0].result,
       pace: data[0].pace
     }
 
      return {code: "USER_RECORD_SUCCESS", result: final_data};
     
  }
};

module.exports = record;