const mysql = require("mysql2");
var cookie = require("cookie-parser");
var session = require("express-session");
const { authenticate } = require("passport");
const request = require("request");
let conn_info = {
    host : 'localhost',
    port : 3320,
    user : 'root',
    password : '1234',
    database : 'product'
}

//session 출력 형태
//req.user: id값
//req.session.passport: {user:id값} 

module.exports = function(app, passport){
    app.get('/',function(req, res){
        console.log('passport.user:',req.session.passport)
        console.log('session:',req.session)
        res.render('index.ejs', {session:req.session.passport})
    })
    
    app.get('/login', function(req, res){
        res.render('login.ejs')
    })
    
    app.get('/login/kakao', passport.authenticate("kakao"))

    app.get('/login/kakao/callback', passport.authenticate('kakao', {
        successRedirect: '/',
        failureRedirect: '/login'
        })
    )

    app.get('/login/naver', passport.authenticate('naver'))

    app.get('/login/naver/callback', passport.authenticate('naver', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

    app.get('/mypage', function(req, res){
        if(!req.user){
            res.render('login.ejs')
        }else{
            let conn=mysql.createConnection(conn_info);
            conn.query('select id,role from guest_kakao where id=? union all select id,role from guest_naver where id=?',[req.user,req.user],(err, result)=>{
                console.log(err)
                if(result[0].role == 'buyer'){
                    res.render('mypage_buyer.ejs',{session:req.session.passport})
                }else{
                    res.render('mypage_seller.ejs',{session:req.session.passport})
                }
            })
        }
    })

    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    })
}