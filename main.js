var express = require('express')
var app = express();
var ejs = require("ejs")
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var session = require("express-session");
var cookie = require("cookie-parser");
var bodyParser = require("body-parser");
var fileupload = require("express-fileupload");

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


var login = require('./router/login')(app, passport)
var router = require('./router/router')(app)
var join = require('./router/join')(app)


var server = app.listen(2000, function(){
    console.log("서버 실행중")
})