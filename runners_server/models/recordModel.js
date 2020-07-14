const pool = require('./pool');
const table = 'user';

const record = {
  getAllRecords: async (id) => {

    const query = 
    `SELECT SUBSTR(r.created_time, 1, 10) as date, r.distance, 
    TIMEDIFF(r.end_time, r.created_time) as time, r.run_idx, r.result, r.game_idx
    FROM user u, run r
    WHERE u.user_idx = "${id}" AND u.user_idx = r.user_idx 
    ORDER BY r.run_idx`;

    const data = await pool.queryParam(query);

    if(data.length === 0) {
      return {code: "SUCCESS_BUT_NO_DATA", result: {}};
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
    `SELECT MONTH(created_time) as month,
    DAY(created_time) as day,
    TIMEDIFF(r.end_time, r.created_time) as time,
    TIME(created_time) as create_time,
    TIME(end_time) as end_time
    FROM run r
    WHERE user_idx = "${user_idx}" AND run_idx = "${run_idx}"`;

    const coordinate =  
    `SELECT latitude, longitude 
    FROM coordinate
    WHERE run_idx =  "${run_idx}"`;

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

    console.log(real_result);

    return {code: "RECORD_DETAIL_SUCCESS", result: real_result};
   
  },

  getUserIdxRunIdxRecord: async(user_idx, run_idx) => {

    const query = 
    `SELECT r.distance, r.time, r.result, (r.time * 1000)/r.distance as pace
    FROM run r
    WHERE r.user_idx = "${user_idx}" 
    AND r.run_idx = "${run_idx}"`;

    const data = await pool.queryParam(query);

    if(data.length === 0) {
      return "WRONG_PARM";
    }
    
    let result_data=2;
    if( data[0].result === 1 || data[0].result === 5 )
      result_data = 1;

      const final_data = {
        distance: data[0].distance,
        time: data[0].time,
        pace: data[0].pace,
        result: result_data
       };
      return {code: "USER_RECORD_SUCCESS", result: final_data};
  },

  getBadge: async(id) => {
    const query = `SELECT badge FROM ${table} WHERE user_idx = "${id}"`;
    const data = await pool.queryParam(query);

    if(data.length === 0) {
      //return "SUCCESS_BUT_NO_DATA";
      return {code: "SUCCESS_BUT_NO_DATA", result: {}};
    }

    const result = {badge : []};
    const bin = data[0].badge;

    for(let i = 0; i < bin.length; i++){
      result.badge.push(bin[i] === '1');
    }
    return result;
  },

  //최근기록 
  getUserRecentRecord: async(id) => {

    const query = 

    `SELECT r.distance, TIMEDIFF(r.end_time, r.created_time) as time, (r.time * 1000)/r.distance as pace,  r.result
    FROM run r
    WHERE r.user_idx = "${id}"
    ORDER BY r.run_idx DESC 
    limit 1`;

    const data = await pool.queryParam(query);
    if(data.length === 0) {
      return {code: "SUCCESS_BUT_NO_DATA", result: {}};
    }

    return data;

//     const final_data = {
//       distance: data[0].distance,
//       time: data[0].time,
//       pace: data[0].pace,
//       result: data_win_lose
//     };


    // let result_num;
    // result_num = 1;
    // if(data[0].result === 1 || data[0].result === 5) {
    //   result_num = 0;
    // } 
    
    // final_data.push( {
    //   date: data[0].date,
    //   distance: data[0].distance,
    //   time: data[0].time,
    //   run_idx: data[0].run_idx,
    //   result: result_num,
    //   game_idx: data[0].game_idx,
    // });

    // return {code: "GET_RECENT_RECORD_SUCCESS", result: final_data};
    
  },

  getUserIdxRunIdxRecord: async(user_idx, run_idx) => {

    const query = 
    `SELECT r.distance, TIMEDIFF(r.end_time, r.created_time) as time, r.result, (r.time * 1000)/r.distance as pace
    FROM run r
    WHERE r.user_idx = "${user_idx}" 
    AND r.run_idx = "${run_idx}"`;

    const data = await pool.queryParam(query);
    

    if(data.length === 0) {
      return {code: "SUCCESS_BUT_NO_DATA", result: {}};
    }
    const final_data = {
      distance: data[0].distance,
      time: data[0].time,
      pace: data[0].pace,
      result: (data[0].result === 1 || data[0].result === 5) ? 1 : 2
    };
    
    return {code: "USER_RECORD_SUCCESS", result: final_data};

  },

  //상대방 기록보기
  //쿼리문을 2개를 사용해서 접근하는 것이 과연 좋은 방법인가?! --> JOIN을 사용하는 것이 더 좋을까?
  getOpponentRecord: async(user_idx, game_idx) => {
     const query = 
     `SELECT r.distance, TIMEDIFF(r.end_time, r.created_time) as time, (r.time * 1000)/r.distance as pace
     FROM run r
     WHERE r.game_idx = "${game_idx}"
     AND r.user_idx != "${user_idx}"`;

     const query_nickname = `SELECT nickname FROM user WHERE user_idx = "${user_idx}"`;
 
     const data = await pool.queryParam(query);
     const user_nickname = await pool.queryParam(query_nickname);

     if(data.length === 0) {
      return "WRONG_PARM";
    } 

     const final_data = {
       nickname: user_nickname[0].nickname,
       distance: data[0].distance,
       time: data[0].time,
       pace: data[0].pace
     };
 
      return {code: "USER_RECORD_SUCCESS", result: final_data};
     
  },
  getBadgeDetail: async(user_idx, flag) => {

    const titles = ["첫 승 달성", "10승 달성", "50승 달성", "최고 페이스", "최장 거리", "최저 페이스",
    "50시간 달성", "100시간 달성", "150시간 달성", "10일 연속 러닝", "연속 5승", "연속 10승"];

    const contents = ["첫 승을 달성하신\n러너에게 드리는 뱃지입니다", "10승을 달성하신\n러너에게 드리는 뱃지입니다",
    "50승을 달성하신\n러너에게 드리는 뱃지입니다", "최고 페이스를 경신하신\n러너에게 드리는 뱃지입니다",
      "최장 거리를 경신하신\n러너에게 드리는 뱃지입니다", "최저 페이스를 경신하신\n러너에게 드리는 뱃지입니다",
    "50시간 러닝을 달성하신\n러너에게 드리는 뱃집입니다", "100시간 러닝을 달성하신\n러너에게 드리는 뱃지입니다",
    "150시간 러닝을 달성하신\n러너에게 드리는 뱃지입니다", "10일 연속 러닝을 하신\n러너에게 드리는 뱃지입니다",
    "연속 5승을 달성하신\n러너에게 드리는 뱃지입니다", "연속 10승을 달성하신\n러너에게 드리는 뱃지입니다"];

    const littleContents = ["알을 깨고 나오셨군요!", "러닝 병아리로 거듭나셨네요!", "50승 멘트줘",
    "최고 페이스 날짜", "최장 거리 날짜", "최저 페이스 날짜",
    "티끌모아 태산이에요\n100시간이 코 앞이에요", "100시간 멘트주세요", "150시간 멘트주세요",
    "스트라이크!\n지치지 않는 체력이 대단해요", "5승 멘트주세요", "10승 멘트주세요"];

    const result =  {
      title : titles[flag],
      content : contents[flag],
      littleContent : littleContents[flag],
      option : ""
    };


    if(flag === 3 || flag === 4 || flag === 5){

      let query =
          `SELECT r.distance, ((r.time / 60) / (r.distance / 1000)) as pace, SUBSTR(r.created_time, 1, 10) as time
     FROM run r
     WHERE user_idx = ? AND ((r.time / 60) / (r.distance / 1000)) < 100
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
      result.littleContent = rows[0].time;

      console.log(rows);
      switch(flag){
      case 3:
        result.option = rows[0].pace;
        break;
      case 4:
        result.option = rows[0].distance;
        break;
      case 5:
        result.option = rows[0].pace;
      }
    }
    return ({"code" : "BADGE_DETAIL",
      result : result});

  },
  updateBadge1: async(user_idx)=>{

  },
  updateBadge2: async(user_idx)=>{

  },
  updateBadge3: async(user_idx)=>{

  },
  updateBadge4: async(user_idx)=>{

  },
  updateBadge5: async(user_idx)=>{

  },
  updateBadge6: async(user_idx)=>{

  },
  updateBadge7: async(user_idx)=>{

  },
  updateBadge8: async(user_idx)=>{

  },
  updateBadge9: async(user_idx)=>{

  },
  updateBadge10: async(user_idx)=>{

  },
  updateBadge11: async(user_idx)=>{

  },
  updateBadge12: async(user_idx)=>{

  },
};

module.exports = record;