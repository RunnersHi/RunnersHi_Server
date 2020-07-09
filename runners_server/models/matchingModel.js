//mysql connection
const mysql = require("mysql");
const DBConfig = require("./../config/DBConfig");
const pool = mysql.createPool(DBConfig);


const match = {
    getUserIdx: async (id) => {
        const query = `SELECT user_idx FROM user WHERE id="${id}"`;
        try {
            const result = await pool.queryParam(query);
            return result[0];
        }
        catch (err) {
            throw(err);
        }
    },

    getUserInfo: async (idx) => {
        const user_fields = 'nickname, level, gender, image'
        const user_query = `SELECT ${user_fields} FROM user WHERE user_idx="${idx}"`;
        const user_result = await pool.queryParam(user_query);
        const win_query = `SELECT COUNT(if(user_idx="${idx}" AND result=0), 1, null) as win FROM run`;
        const lose_query = `SELECT COUNT(if(user_idx="${idx}" AND (result=1 OR result=2)), 1, null) as lose FROM run`;
        const win_result = await pool.queryParam(win_query);
        const lose_result = await pool.queryParam(lose_query);
        const final_result = {
            name: user_result[0].nickname,
            level: parseInt(user_result[0].level, 10),
            gender: parseInt(user_result[0].gender, 10),
            image: parseInt(user_result[0].image, 10),
            win: parseInt(win_result[0].win, 10),
            lose: parseInt(lose_result[0].lose, 10)
        }

        return final_result;
    }
}

module.exports = match;