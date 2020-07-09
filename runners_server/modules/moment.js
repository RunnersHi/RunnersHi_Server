const moment = require('moment');


module.exports = {
  currentYM: async() => {
    const currentYearMonth = moment().format("YYYY-MM");

    return currentYearMonth;
  },
  currentYear: async() => {
    const currentYear = moment().format("YY");
    
    return currentYear;
  }

  // currentMonth: async() => {
  //   const current
  // }
};