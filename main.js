var express = require('express')
var app = express();
var ejs = require("ejs")
var mysql = require("mysql2")
var passport = require("passport");
var kakaostrategy = require("passport-kakao").Strategy;

app.set("view engine", "ejs");
app.engine("ejs", ejs.renderFile);
app.use(express.static(__dirname+'/public'))    //__dirname 빼먹어서 기본경로가 설정 안됐어 ==> css파일 경로도 못찾았던 원인


const kakaoKey = {
    clientID: "b2b62640b451c5d298b88e5b2325b09b",
    clientsecret: "YmB07uLz8NwbwWIxleOTAgs5pvMaaJ94",
    callbackURL: "http://localhost:2000/login/kakao/callback"
}

passport.use(new kakaostrategy(kakaoKey, (accessToken, refreshToken, profile, done)=>{
    console.log(profile);
    console.log(accessToken);
    console.log(refreshToken);
}))


var router1 = require('./router1')(app, passport)

var server = app.listen(2000, function(){
    console.log("서버 실행중")
})