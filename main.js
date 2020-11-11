var express = require('express')
var app = express();
var ejs = require("ejs")
var mysql = require("mysql2")

app.set("view engine", "ejs");
app.engine("ejs", ejs.renderFile);
app.use(express.static(__dirname+'/public'))    //__dirname 빼먹어서 기본경로가 설정 안됐어 ==> css파일 경로도 못찾았던 원인

var router1 = require('./router1')(app)

var server = app.listen(2000, function(){
    console.log("서버 실행중")
})