const moment = require('moment');

const formatMessag = (data) => {
    msg = {
        from:data.fromUser,
        to:data.toUser,
        message:data.msg,
        date: moment().format("YYYY-MM-DD"),
        time: moment().format("hh:mm a")
    }
    return msg;
}

module.exports=formatMessag;