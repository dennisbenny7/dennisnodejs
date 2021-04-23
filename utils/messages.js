const MongoClient= require("mongodb").MongoClient;

const moment = require('moment');

function formatMessage(username, text) {


  var tim= moment().format('h:mm a')
  return {
    username,
    text,
    time:tim
  };
}

module.exports = formatMessage;
