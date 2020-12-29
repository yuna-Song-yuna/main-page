var express = require('express')
var app = express();
var ejs = require("ejs")
var mysql = require("mysql2")
var passport = require("passport");
var session = require("express-session");
var cookie = require("cookie-parser");
var bodyParser = require("body-parser");
var multer = require('multer')
var fileupload = require("express-fileupload");
var kakaostrategy = require("passport-kakao").Strategy;
var naverstrategy = require("passport-naver").Strategy;

app.set("view engine", "ejs");
app.engine("ejs", ejs.renderFile);
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(fileupload({
    createParentPath : true
}));
app.use(express.static(__dirname+'/public'))    //__dirname 빼먹어서 기본경로가 설정 안됐어 ==> css파일 경로도 못찾았던 원인
app.use(session({
    secret: 'abcde',
    resave: false,
    saveUninitialized: true
}))
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
    var user = {
        id: profile.id
    }
    console.log(user)
    let conn = mysql.createConnection(conn_info);
    conn.query('select id from guest where id=?',profile.id,(err, result)=>{
        if(result.length == 0){
            conn.query('insert into guest (id, connect) values (?,?)',[profile.id, 'kakao'], (err)=>{
                console.log(err)
            })
        }

    return done(null, user)

    })
    })
)

passport.use(new naverstrategy(naverKey, (accessToken, refreshToken, profile, done)=>{
    process.nextTick(function(){
        var user = {
            id: profile._json.id,
            name: profile.name,
            email: profile.emails[0].value,
            username: profile.displayName,
            provider: 'naver',
            naver: profile._json
        }
        console.log("user:",user)
        return done(null, user)     //done 호출 시 두번째 인자(user)가 serializeUse로 전달
    })
    let conn = mysql.createConnection(conn_info)
    conn.query('select id from guest where id=?',profile._json.id,(err, result)=>{
        if(result.length == 0){
            let sql = 'insert into guest values (?,?,?,?,?,?,?)'
            let val = [profile._json.id, profile.emails[0].value, profile._json.age, profile._json.name, profile._json.birthday, 'buyer', 'naver']
            conn.query(sql, val, (err)=>{
                console.log(err)
            })                
        }
    })
}))

//naver api 쓰는데 failed to serialize user into session 에러 발생해서 추가했음
passport.serializeUser(function(user, done){
    done(null, user.id)
    console.log('serializeUser session:'+user.id)
})

passport.deserializeUser(function(req, user, done){
    done(null, user)
    console.log('deserializeUser:',req.session)
    console.log('req.user:',req.user)   //req.user가 있는 경우 소셜로그인에 성공한 것
    console.log('deserializeUser session id:'+req.session.id)
})

var router1 = require('./router1')(app, passport)

var server = app.listen(2000, function(){
    console.log("서버 실행중")
})