//mysql connection
const mysql = require("mysql");
const DBConfig = require("./../config/DBConfig");
const { queryParam, queryParamArr } = require("./pool");
const pool = mysql.createPool(DBConfig);

async function asyncP() {
    return 'Mark';
}

const match = {
    getUserIdx: async (id) => {
        const query = `SELECT user_idx FROM user WHERE id="${id}"`;
        try {
            const result = await queryParam(query);
            return result[0];
        }
        catch (err) {
            throw(err);
        }
    },

    getUserInfo: async (idx) => {
        const user_fields = 'nickname, level, gender, image'
        const user_query = `SELECT ${user_fields} FROM user WHERE user_idx="${idx}"`;
        const user_result = await queryParam(user_query);
        const win_query = `SELECT COUNT(if(user_idx="${idx}" AND result=0), 1, null) as win FROM run`;
        const lose_query = `SELECT COUNT(if(user_idx="${idx}" AND (result=1 OR result=2)), 1, null) as lose FROM run`;
        const win_result = await queryParam(win_query);
        const lose_result = await queryParam(lose_query);
        const final_result = {
            name: user_result[0].nickname,
            level: user_result[0].level,
            gender: user_result[0].gender,
            image: user_result[0].image,
            win: win_result[0].win,
            lose: lose_result[0].lose
        };
        return final_result;
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
        const questions = "?, ?, ?, ?, ?";
        const run_query = `INSERT INTO run (${run_fields}) VALUES (${questions})`;
        const run_values = [distance, time, result, created_time, end_time, user_idx, game_idx];
        
        try {
            const run_result = await queryParamArr(run_query, run_values);
            const run_idx = run_result.insertId;
            const coordinate_fields = `latitude, longitude, run_idx`;
            const coordinate_query = `INSERT INTO coordinate (${coordinate_fields}) VALUES (?, ?, ${run_idx})`;
            const coordinate_result = await queryParamArr(coordinate_query, coordinates);
            return coordinate_result.affectedRows;
        }
        catch (err) {
            console.log("Store Data Error");
            throw (err);
        }
    }
}

module.exports = match;