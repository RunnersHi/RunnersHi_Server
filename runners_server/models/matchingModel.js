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
        const fields_1 = 'nickname, level, gender, image'
        const query_1 = `SELECT ${fields} FROM user WHERE user_idx="${idx}"`;
        const result_1 = await pool.queryParam(query);
        const query_2 = `SELECT COUNT(if(user_idx=${idx}, )) FROM `
    }
}

module.exports = match;