//mysql connection
const mysql = require("mysql");
const DBConfig = require("./../config/DBConfig");
const { queryParam, queryParamArr } = require("./pool");
const pool = mysql.createPool(DBConfig);

const match = {
    getUserIdx: async (id) => {
        const query = `SELECT user_idx FROM user WHERE id="${id}"`;
        try {
            const result = await queryParam(query);
            console.log("UserIdx: ", result);
            return result[0];
        }
        catch (err) {
            console.log("getUserIdx error");
            throw(err);
        }
    },

    getUserInfo: async (idx) => {
        if (idx === -2) {
            return "TOKEN INVALID";
        }
        else if (idx === -3) {
            return "TOKEN EXPIRED";
        }
        else {
            try {
                const user_fields = 'nickname, level, gender, image';
                const user_query = `SELECT ${user_fields} FROM user WHERE user_idx="${idx}"`;
                const user_result = await queryParam(user_query);
                const record_query = 
                `SELECT 
                COUNT(if((user_idx="${idx}" AND (result=1 OR result=5)), 1, null)) as win, 
                COUNT(if((user_idx="${idx}" AND (result=2 OR result=3)), 1, null)) as lose 
                FROM run`;
    
                const record_result = await queryParam(record_query);
    
                if (record_result.win === undefined) {
                    record_result.win = 0;
                }
    
                if (record_result.lose === undefined) {
                    record_result.lose = 0;
                }
                
                console.log("User Result: ", user_result);
                console.log("Win Result: ", record_result.win);
                console.log("Lose Result: ", record_result.lose);
                const final_result = {
                    name: user_result[0].nickname,
                    level: user_result[0].level,
                    gender: user_result[0].gender,
                    image: user_result[0].image,
                    win: record_result[0].win,
                    lose: record_result[0].lose
                };
                return final_result;
            }
            catch(err) {
                console.log("getUserInfo error");
                throw(err);
            }
        }
    },

    newGameIdx: async() => {
        try {
            let query = "INSERT INTO game (game_idx) VALUES (0)";
            const result = await queryParam(query);
            return result.insertId;
        }
        catch (err) {
            throw (err);
        }
    },

    storeRunningData: async(distance, time, coordinates, result, created_time, end_time, user_idx, game_idx) => {
        const run_fields = 'distance, time, result, created_time, end_time, user_idx, game_idx';
        const questions = "?, ?, ?, ?, ?, ?, ?";
        const run_query = `INSERT INTO run (${run_fields}) VALUES (${questions})`;
        const run_values = [distance, time, result, created_time, end_time, user_idx, game_idx];
        
        try {
            const run_result = await queryParamArr(run_query, run_values);
            const run_idx = run_result.insertId;
            const coordinate_fields = `latitude, longitude, run_idx`;
            let coordinateArr = [];

            for (var i = 0; i < coordinates.length; i++) {
                let temp = Object.values(coordinates[i]);
                temp.push(run_idx);
                coordinateArr.push(temp);
            }
            const coordinate_query = `INSERT INTO coordinate (${coordinate_fields}) VALUES ?`;
            const coordinate_result = await queryParamArr(coordinate_query, [coordinateArr]);
            return run_idx;
        }
        catch (err) {
            console.log("Store Data Error");
            throw (err);
        }
    }
}

module.exports = match;