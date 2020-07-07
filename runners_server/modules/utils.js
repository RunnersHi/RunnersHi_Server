const util = {
  success: (status, message, data) => {
    return {
      status: status,
      success: true,
      message: message,
      result: data,
    };
  },
  fail: (status, message) => {
    return {
      status: status,
      success: false,
      message: message,
    };
  },
};

module.exports = util;
