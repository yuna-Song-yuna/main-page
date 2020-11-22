const mysql = require("mysql2")
const request = require("request");
let conn_info = {
    host : 'localhost',
    port : 3320,
    user : 'root',
    password : '1234',
    database : 'product'
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

    // app.get('/login/kakao/callback',function(req, res, next){
    //     passport.authenticate('kakao', function(err, user){
    //         console.log('passport.authenticate(kakao)실행')
    //         if (!user){
    //             return res.redirect('http://locathost:2000/login')
    //         }
    //         req.login(user, function(err){
    //             console.log('kakao/callback user:', user);
    //             return req.redirect('http://localhost:2000/');
    //         });
    //     });(req,res)
    // })

    app.get('/login/naver', passport.authenticate('naver'))

    app.get('/login/naver/callback', passport.authenticate('naver', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

}