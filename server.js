const xServerUtils = require("./config/xExpressUtil");

xServerUtils.connectMongoDB();
xServerUtils.createApp(require("./routes/index"));
console.log("started!");
