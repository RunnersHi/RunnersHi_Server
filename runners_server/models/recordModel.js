const pool = require('./pool');
const table = 'user';

const record = {
  getUserImg: async (user_idx) => {
    const query = 
    `
    SELECT 
      image
    FROM 
      user
    WHERE 
      user_idx = "${user_idx}"
    `;

    const image = await pool.queryParam(query);
    return image;
  },

  getPace: async (time, distance) => {

    let pace_minute = ( time /60 ) / ( distance / 1000 );
    let pace_second = (pace_minute - Math.floor(pace_minute)) * 60;

    const result = {};
    result.pace_minute = Math.floor(pace_minute);
    result.pace_second = Math.floor(pace_second);

    return result;
  },

  getAllRecords: async (id) => {

    const query = 
    `SELECT 
      SUBSTR(r.created_time, 1, 10) as date, r.distance, 
      TIMEDIFF(r.end_time, r.created_time) as time, r.run_idx, r.result, r.game_idx
    FROM 
      user u, run r
    WHERE 
      u.user_idx = "${id}" AND u.user_idx = r.user_idx 
    ORDER BY 
      r.run_idx`;

    const data = await pool.queryParam(query);

    if(data.length === 0) {
      return "SUCCESS_BUT_NO_DATA";
    } 
    const final_data = [];

    for(let i = 0; i < data.length; i++){
      final_data.push({
        date: data[i].date,
        distance: data[i].distance,
        time: data[i].time,
        run_idx: data[i].run_idx,
        result: (data[i].result === 1 || data[i].result === 5) ? 1 : 2,
        game_idx: data[i].game_idx,
      });
    }

    return {code: "RECORD_ALL_SUCCESS", result: final_data};
  },

  getDetailRecord: async(user_idx, run_idx) => {
   
    const query = 
    `SELECT 
      MONTH(created_time) as month,
      DAY(created_time) as day,
      TIMEDIFF(r.end_time, r.created_time) as time,
      TIME(created_time) as create_time,
      TIME(end_time) as end_time
    FROM 
      run r
    WHERE 
      user_idx = "${user_idx}" AND run_idx = "${run_idx}"`;

    const coordinate =  
    `SELECT 
      latitude, longitude 
    FROM 
      coordinate
    WHERE 
      run_idx =  "${run_idx}"`;

    const data = await pool.queryParam(query);
    const coordiData = await pool.queryParam(coordinate);

    if(data.length === 0 || coordiData.length === 0) {
      return "WRONG_PARM";
    }

    const real_result = {
      month: data[0].month,
      day: data[0].day,
      time : data[0].time,
      start_time: data[0].create_time,
      end_time: data[0].end_time,
      coordinate: coordiData
    };

    return {code: "RECORD_DETAIL_SUCCESS", result: real_result};
  },

  getUserIdxRunIdxRecord: async(user_idx, run_idx) => {

    const query = 
    `SELECT 
      r.distance, 
      r.time,
      TIMEDIFF(r.end_time, r.created_time) as time_diff, 
      r.result
    FROM 
      run r
    WHERE 
      r.user_idx = "${user_idx}" 
    AND 
      r.run_idx = "${run_idx}"`;

    const data = await pool.queryParam(query);

    if(data.length === 0) {
      return "WRONG_PARM";
    }

    const pace_data = await record.getPace(data[0].time, data[0].distance);
    
    let result_data=2;
    if( data[0].result === 1 || data[0].result === 5 )
      result_data = 1;

      const final_data = {
        distance: data[0].distance,
        time: data[0].time_diff,
        pace_minute: pace_data.pace_minute,
        pace_second: pace_data.pace_second,
        result: result_data
       };
      return {code: "USER_RECORD_SUCCESS", result: final_data};
  },

  getBadge: async(id) => {
    const query = `SELECT badge FROM ${table} WHERE user_idx = "${id}"`;
    const data = await pool.queryParam(query);

    if(data.length === 0) {
      return "SUCCESS_BUT_NO_DATA";
    }

    const result = {badge : []};
    const bin = data[0].badge;

    for(let i = 0; i < bin.length; i++){
      result.badge.push(bin[i] === '1');
    }
    return result;
  },
  getRecentRecordByTime: async(user_idx, time)=>{
    const query = `SELECT distance, TIMEDIFF(r.end_time, r.created_time) as time, (r.time / 60) / (r.distance / 1000) as pace
    FROM run r WHERE user_idx = ? AND time = ? ORDER BY run_idx DESC LIMIT 1`;
    const rows = await pool.queryParamArr(query, [user_idx, time]);
    if(rows.length === 0) return false;
    else return rows[0];
  },

  getUserRecentRecord: async(id) => {

    const query = 
    `
    SELECT 
      r.distance, r.time,
      TIMEDIFF(r.end_time, r.created_time) as time_diff,  
      r.result, r.game_idx,
      SUBSTR(r.created_time, 1, 10) as created_time
    FROM 
      run r
    WHERE 
      r.user_idx = "${id}"
    ORDER BY 
      r.run_idx DESC 
    limit 1`;

    const data = await pool.queryParam(query);
    if(data.length === 0) {
      return {code: "SUCCESS_BUT_NO_DATA", result: {}};
    }

    return data;
  },

  //상대방 기록보기
  //쿼리문을 2개를 사용해서 접근하는 것이 과연 좋은 방법인가?! --> JOIN을 사용하는 것이 더 좋을까?
  getOpponentRecord: async(user_idx, game_idx) => {
     const query = 
     `
     SELECT 
      r.distance, r.time,
      TIMEDIFF(r.end_time, r.created_time) as diff_time
     FROM 
      run r
     WHERE 
      r.game_idx = "${game_idx}"
     AND 
      r.user_idx != "${user_idx}"`;

     const query_nickname = `
     SELECT nickname 
     FROM user 
     WHERE user_idx = "${user_idx}"`;
 
     const data = await pool.queryParam(query);
     const user_nickname = await pool.queryParam(query_nickname);

     if(data.length === 0) {
      return "WRONG_PARM";
    } 
    const pace_data = await record.getPace(data[0].time, data[0].distance);

    return {
        nickname: user_nickname[0].nickname,
        distance: data[0].distance,
        time: data[0].diff_time,
        pace_minute: pace_data.pace_minute,
        pace_second: pace_data.pace_second
      };
  },
  
  getBadgeDetail: async(user_idx, flag) => {

    const titles = ["첫 승 달성", "10승 달성", "50승 달성", "최고 페이스", "최장 거리", "최저 페이스",
    "50시간 달성", "100시간 달성", "150시간 달성", "10일 연속 러닝", "연속 5승", "연속 10승"];

    const contents = ["첫 승을 달성하신\n러너에게 드리는 뱃지입니다", "10승을 달성하신\n러너에게 드리는 뱃지입니다",
    "50승을 달성하신\n러너에게 드리는 뱃지입니다", "최고 페이스를 경신하신\n러너에게 드리는 뱃지입니다",
      "최장 거리를 경신하신\n러너에게 드리는 뱃지입니다", "최저 페이스를 경신하신\n러너에게 드리는 뱃지입니다",
    "50시간 러닝을 달성하신\n러너에게 드리는 뱃집입니다", "100시간 러닝을 달성하신\n러너에게 드리는 뱃지입니다",
    "150시간 러닝을 달성하신\n러너에게 드리는 뱃지입니다", "10일 연속 러닝을 하신\n러너에게 드리는 뱃지입니다",
    "연속 5승을 하신\n러너에게 드리는 뱃지입니다", "연속 10승을 하신\n러너에게 드리는 뱃지입니다"];


    const littleContents = ["알을 깨고 나오셨군요!", "러닝 병아리로 거듭나셨네요!", "오늘 저녁은 치킨이닭!",
    "최고 페이스 날짜", "최장 거리 날짜", "최저 페이스 날짜",
    "티끌모아 태산이에요\n100시간이 코 앞이에요", "당신은 아무래도\n좀 달릴 줄 아는 러너인 것 같군요", "150시간의 러닝을 통해\n더욱 건강해진 것을 축하해요",
    "스트라이크!\n지치지 않는 체력이 대단해요", "연속 5승으로 만족하실 건 아니죠?\n연속 10승에 도전해보세요", "이 러너가 요즘 잘 달린다는\n소문이 있던데요?"];

    const result =  {
      title : titles[flag],
      content : contents[flag],
      littleContent : littleContents[flag],
      option : ""
    };

    if(flag === 3 || flag === 4 || flag === 5){

      let query =
          `SELECT r.distance, ((r.time / 60) / (r.distance / 1000)) as pace, SUBSTR(r.created_time, 1, 10) as created_time, time
     FROM run r
     WHERE user_idx = ? AND ((r.time / 60) / (r.distance / 1000)) < 60
     ORDER BY `;

      switch(flag){
        case 3:
          query += `pace`;
          break;
        case 4:
          query += `distance DESC`;
          break;
        case 5:
          query += `pace DESC`
      }
      query += ` LIMIT 1`;
      const rows = await pool.queryParamArr(query, [user_idx]);
      result.littleContent = rows[0].created_time;

      switch(flag){
      case 3:
      case 5:
        const pace = await record.getPace(rows[0].time, rows[0].distance);
        result.option = pace.pace_minute + "'" + pace.pace_second + `"`;
        break;
      case 4:
        result.option = rows[0].distance;
      }
    }
    return ({"code" : "BADGE_DETAIL",
      result : result});

  },

  updateBadge: async(user_idx, badgeFlag)=>{
    const query = `UPDATE user SET badge = ? WHERE user_idx = ?`;
    await pool.queryParamArr(query, [badgeFlag, user_idx]);
  },
  
  updateBadgeByWin: async(user_idx, win)=>{
    const query = `SELECT COUNT(IF(result = 1, 1, null) OR IF(result = 5, 1, null)) as win FROM run WHERE user_idx = ?`;
    const rows = await pool.queryParamArr(query, [user_idx]);
    return win <= rows[0].win;
  },

  getSumRunningTime: async(user_idx) => {
    const query =
      `
      SELECT SUM(time) as total_time
      FROM run
      WHERE user_idx = ${user_idx}
      `;

    return await pool.queryParam(query);
  },

  getContinuityWin: async(user_idx) => {
    const query =
      `
      SELECT result, created_time
      FROM run
      WHERE user_idx = ${user_idx}
      ORDER BY run_idx
      `;

      const data = await pool.queryParam(query);

      if(data.length < 5)
        return 0;
      
      let count = 0;
      let max_count =0;
      for(let i = 0; i<data.length; i++) {
        if(data[i].result === 1 || data[i].result === 5) {
          count++;
        }
        else {
          if(count > max_count){
            max_count = count;
          }
          count = 0;
        }
      }
      return max_count;
  },
  
  getContinuityRunning: async(user_idx) => {
    const query =
      `
      SELECT DISTINCT
        DATEDIFF(NOW(), created_time) as diff 
      FROM 
        run
      WHERE 
        user_idx = ${user_idx}
      ORDER BY 
        diff
      `;

      const data = await pool.queryParam(query);

      if(data.length < 10)
        return 0;

      let start = data[0].diff;
      let continueous = 0;
      let max = 0;

      for(let i=1; i<data.length; i++) {
        if( (start+1) === data[i].diff) {
          start++;
          continueous++;
        }
        else {
          if(max < continueous)
            max = continueous;
          start = data[i].diff;
          continueous = 0;
        }
      }
      return max;
  },

  updateBadgeByPace: async(user_idx, top)=>{
    let query = `SELECT ((r.time / 60) / (r.distance / 1000)) as pace FROM run r WHERE user_idx = ? ORDER BY run_idx LIMIT 1`;

    const paceRows = await pool.queryParamArr(query, [user_idx]);

    if(top)
      query = `SELECT ((r.time / 60) / (r.distance / 1000)) as pace FROM run r WHERE user_idx = ? 
      AND ((r.time / 60) / (r.distance / 1000)) < 100 AND ((r.time / 60) / (r.distance / 1000)) < ?`;
    else
      query = `SELECT ((r.time / 60) / (r.distance / 1000)) as pace FROM run r WHERE user_idx = ? 
      AND ((r.time / 60) / (r.distance / 1000)) < 100 AND ((r.time / 60) / (r.distance / 1000)) > ?`;

    const rows = await pool.queryParamArr(query, [user_idx, paceRows[0].pace]);
    return rows.length !== 0;
  },
  
  updateBadgeByDistance: async(user_idx)=>{
    let query = `SELECT distance FROM run WHERE user_idx = ? ORDER BY run_idx LIMIT 1`;

    const distanceRows = await pool.queryParamArr(query, [user_idx]);

    query = `SELECT distance FROM run r WHERE user_idx = ? 
      AND ((r.time / 60) / (r.distance / 1000)) < 100 AND distance > ?`;

    const rows = await pool.queryParamArr(query, [user_idx, distanceRows[0].distance]);

    return rows.length !== 0;
  },
  postRun: async(userData) => {
    const run_query = `INSERT INTO run (distance, time, result, created_time, end_time, user_idx, game_idx) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const run_result = await pool.queryParamArr(run_query, [userData.distance,
      userData.time, userData.result, userData.created_time, userData.end_time, userData.user_idx, userData.game_idx]);

    const run_idx = run_result.insertId;
    const coordinate_query = `INSERT INTO coordinate SET ?, run_idx = ${run_idx}`;
    await pool.queryParamArr(coordinate_query, userData.coordinates);

    return run_idx;
  },
  getDummy : async(level, gender, time)=>{
    let userDatas = [
      {gender : 1, level : 1, time : "00:30:00", distance : 3760, win : 3, lose : 2},
      {gender : 1, level : 1, time : "00:45:00", distance : 5600, win : 3, lose : 2},
      {gender : 1, level : 1, time : "01:00:00", distance : 6980, win : 3, lose : 2},
      {gender : 1, level : 1, time : "01:30:00", distance : 9780, win : 3, lose : 2},
      {gender : 1, level : 2, time : "00:30:00", distance : 4760, win : 5, lose : 3},
      {gender : 1, level : 2, time : "00:45:00", distance : 6900, win : 5, lose : 3},
      {gender : 1, level : 2, time : "01:00:00", distance : 8550, win : 5, lose : 3},
      {gender : 1, level : 2, time : "01:30:00", distance : 12010, win : 5, lose : 3},
      {gender : 1, level : 3, time : "00:30:00", distance : 6010, win : 4, lose : 1},
      {gender : 1, level : 3, time : "00:45:00", distance : 8020, win : 4, lose : 1},
      {gender : 1, level : 3, time : "01:00:00", distance : 10230, win : 4, lose : 1},
      {gender : 1, level : 3, time : "01:30:00", distance : 14890, win : 4, lose : 1},
      {gender : 2, level : 1, time : "00:30:00", distance : 2740, win : 3, lose : 2},
      {gender : 2, level : 1, time : "00:45:00", distance : 3500, win : 3, lose : 2},
      {gender : 2, level : 1, time : "01:00:00", distance : 4300, win : 3, lose : 2},
      {gender : 2, level : 1, time : "01:30:00", distance : 5700, win : 3, lose : 2},
      {gender : 2, level : 2, time : "00:30:00", distance : 3520, win : 5, lose : 3},
      {gender : 2, level : 2, time : "00:45:00", distance : 4980, win : 5, lose : 3},
      {gender : 2, level : 2, time : "01:00:00", distance : 5500, win : 5, lose : 3},
      {gender : 2, level : 2, time : "01:30:00", distance : 6980, win : 5, lose : 3},
      {gender : 2, level : 3, time : "00:30:00", distance : 4300, win : 4, lose : 1},
      {gender : 2, level : 3, time : "00:45:00", distance : 6020, win : 4, lose : 1},
      {gender : 2, level : 3, time : "01:00:00", distance : 7320, win : 4, lose : 1},
      {gender : 2, level : 3, time : "01:30:00", distance : 9020, win : 4, lose : 1},
    ];
    let index = 0;
    index += 12 * (gender - 1);
    index += 4 * (level - 1);
    if(time === 5400) index += 3;
    else index += (time-1800) / 900;
    let userData = userDatas[index];
    userData.nickname = "밍찔이";
    userData.image = 8;
    userData.isDummy = true;

    return userData;
  },
};

module.exports = record;