const mysql = require("mysql2")
let conn_info = {
    host : 'localhost',
    port : 3320,
    user : 'root',
    password : '1234',
    database : 'mydb'
}

module.exports = function(app, passport){
    app.get('/',function(req, res){
        res.render('index.ejs')
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
}