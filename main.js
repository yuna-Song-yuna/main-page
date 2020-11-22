var express = require('express')
var app = express();
var ejs = require("ejs")
var mysql = require("mysql2")
var passport = require("passport");
var session = require("express-session");
var kakaostrategy = require("passport-kakao").Strategy;
var naverstrategy = require("passport-naver").Strategy;

app.set("view engine", "ejs");
app.engine("ejs", ejs.renderFile);
app.use(express.static(__dirname+'/public'))    //__dirname 빼먹어서 기본경로가 설정 안됐어 ==> css파일 경로도 못찾았던 원인
app.use(passport.initialize());
app.use(passport.session());

let conn_info = {
    host : 'localhost',
    port : 3320,
    user : 'root',
    password : '1234',
    database : 'product'
}

const kakaoKey = {
    clientID: "b2b62640b451c5d298b88e5b2325b09b",
    clientSecret: "CySxx2jAdMHhnJAS1pzIL8MGiKlEOaGz",
    callbackURL: "http://localhost:2000/login/kakao/callback"
}

const naverKey = {
    clientID: "k5XswujMd_tN3fwskIA2",
    clientSecret: "oRgOjh_XCw",
    callbackURL: "http://localhost:2000/login/naver/callback"

}

passport.use(new kakaostrategy(kakaoKey, (accessToken, refreshToken, profile, done)=>{
    console.log(profile);
    console.log(accessToken);
    console.log(refreshToken);
}))

passport.use(new naverstrategy(naverKey, (accessToken, refreshToken, profile, done)=>{
    process.nextTick(function(){
        var user = {
            name: profile.name,
            email: profile.emails[0].value,
            username: profile.displayName,
            provider: 'naver',
            naver: profile._json
        }
        console.log("user:",user)
        return done(null, user)
    })
    let conn = mysql.createConnection(conn_info)
    conn.query('select id from guest_naver where id=?',profile._json.id,(err, result)=>{
        if(result.length == 0){
            let sql = 'insert into guest_naver values (?,?,?,?,?)'
            let val = [profile._json.id,profile.emails[0].value,profile._json.age,profile._json.name,profile._json.birthday]
            conn.query(sql, val, (err)=>{
                console.log(err)
            })                
        }
    })
}))

//naver api 쓰는데 failed to serialize user into session 에러 발생해서 추가했음
passport.serializeUser(function(user, done){
    done(null, user)
})

var router1 = require('./router1')(app, passport)

var server = app.listen(2000, function(){
    console.log("서버 실행중")
})