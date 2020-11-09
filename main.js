var express = require('express')
var app = express();
var ejs = require("ejs")

app.set("view engine", "ejs");
app.engine("ejs", ejs.renderFile);
app.use(express.static('/public'))

var router1 = require('./router1')(app)

var server = app.listen(2000, function(){
    console.log("서버 실행중")
})