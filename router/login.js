const mysql = require("mysql2");
var cookie = require("cookie-parser");
var session = require("express-session");
const { authenticate } = require("passport");
var LocalStrategy = require("passport-local").Strategy;
const request = require("request");
// var bodyParser = require("body-parser")
// var parser = bodyParser.urlencoded({extended:false});
// var fileupload = require("express-fileupload");
var kakaostrategy = require("passport-kakao").Strategy;
var naverstrategy = require("passport-naver").Strategy;

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
//id 세션값 : req.session.passport.user

module.exports = function(app, passport){

    //local이라는 strategy를 사용한다고 선언해주는 것
    passport.use(new LocalStrategy({
        usernameField: 'username',      //form name
        passwordField: 'password'
        
        //passReqToCallback: true
    }, function(username, password, done){
        console.log(username)
        console.log(password)
        console.log('local-join callback called')
        let conn = mysql.createConnection(conn_info);
        conn.query('select id from guest where id=?', username, (err, result)=>{
            if(result.length >=1){
                var user = {
                    id: username
                }        
                return done(null, user)     //done(에러, 성공했을 때 값, 사용자정의 메시지) 
            }else return done(null, false)  //done을 통해 로그인 성공 여부를 판단
        })
    }
    ))

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
    
    app.get('/',function(req, res){
        // console.log('passport.user:',req.session.passport)
        // console.log('session:',req.session)
        let conn=mysql.createConnection(conn_info);
        let sql = 'select * from sell_product'
        conn.query(sql, (err, result)=>{
            conn.query('select connect from guest where id=?',req.user, (err, result_role)=>{
                console.log('role:', result_role)
                res.render('index.ejs', {session:req.session.passport, result, result_role})
            })
        })
    })
    
    app.get('/login', function(req, res){
        res.render('login.ejs')
    })
    
    app.post('/login/local', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    })
    )

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

    // app.get('/mypage', function(req, res){
    //     if(!req.user){
    //         res.render('login.ejs')
    //     }else{
    //         let conn=mysql.createConnection(conn_info);
    //         conn.query('select id,role,connect from guest where id=?',[req.user],(err, result_role)=>{
    //             console.log(err)
    //             console.log('check',result_role)
    //             console.log('check1',result_role[0])
    //             console.log('check2',result_role[0].connect)
    //             if(result_role[0].role == 'buyer'){
    //                 console.log('result-role:',result_role)
    //                 res.render('mypage_buyer.ejs',{session:req.session.passport, result_role})
    //             }else{
    //                 res.render('mypage_seller.ejs',{session:req.session.passport, result_role})
    //                 console.log('result-role:',result_role)

    //             }
    //         })
    //     }
    // })

    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    })

    // app.get('/regi_item', function(req, res){
    //     if(!req.user){
    //         res.render('index.ejs')
    //     }
    //     res.render('regi_item.ejs',{session:req.session.passport})
    // })

    // //판매 등록
    // app.post('/regi_item_ing',parser, function(req, res){
    //     if(!req.files){     //이미지를 하나라도 전달받으면 등록안한 이미지는 undefined로 전송이 됨 => 에러 안나고 진행
    //                         //근데 이미지를 둘다 전송 안하면 null로 전송됨 => 에러남
    //         var sell_image = 'undefined'
    //         var content_image = 'undefined'
    //     }else{
    //         var sell_image = req.files.sell_image;
    //         var content_image = req.files.content_image;    
    //     }

    //     // console.log('req.files.sell_image:',req.files.sell_image)
    //     // console.log('req.files.content_image:',req.files.content_image)

    //     let conn = mysql.createConnection(conn_info);
    //     if(!req.files){ //이미지 둘 다 등록 안한 경우
    //         let sql = 'insert into sell_product (id, title, price, category, start_date, content_text) values (?,?,?,?,?,?)'
    //         input_data = [req.session.passport.user, req.body.title, req.body.price, req.body.category, req.body.start_date, req.body.content_text]
    //         conn.query(sql, input_data, (err, result)=>{
    //             res.redirect('/')
    //         })
    //         console.log('아이디:',req.session.passport.user)
    //         console.log(req.body.category)      //name='category' <option>의 value값이 들어옴
    //         console.log(req.body.start_date)
    //     }else if(!req.files.sell_image){    //썸네일 이미지 등록 안한 경우
    //         content_image.mv(__dirname+'/public/image/uploads/'+content_image.name) //서버에 이미지 저장

    //         let sql = 'insert into sell_product (id, title, price, category, start_date, content_text, content_image) values (?,?,?,?,?,?,?)'
    //         input_data = [req.session.passport.user, req.body.title, req.body.price, req.body.category, req.body.start_date, req.body.content_text, content_image.name]
    //         conn.query(sql, input_data, (err, result)=>{
    //             console.log(err)
    //             res.redirect('/')
    //         })
    //     }else if(!req.files.content_image){ //상세내용 이미지 등록 안한 경우
    //         sell_image.mv(__dirname+'/public/image/uploads/'+sell_image.name)

    //         let sql = 'insert into sell_product (id, title, price, category, start_date, content_text, thumbnail_image) values (?,?,?,?,?,?,?)'
    //         input_data = [req.session.passport.user, req.body.title, req.body.price, req.body.category, req.body.start_date, req.body.content_text, sell_image.name]
    //         conn.query(sql, input_data, (err, result)=>{
    //             console.log(err)
    //             res.redirect('/')
    //         })
    //     }else{  //이미지 모두 등록 한경우
    //         sell_image.mv(__dirname+'/public/image/uploads/'+sell_image.name)
    //         content_image.mv(__dirname+'/public/image/uploads/'+content_image.name)

    //         let sql = 'insert into sell_product (id, title, price, category, start_date, content_text, content_image, thumbnail_image) values (?,?,?,?,?,?,?,?)'
    //         input_data = [req.session.passport.user, req.body.title, req.body.price, req.body.category, req.body.start_date, req.body.content_text, content_image.name, sell_image.name]
    //         conn.query(sql, input_data, (err, result)=>{
    //             console.log(err)
    //             res.redirect('/')
    //         })
    //     }
        
    //     console.log(req.body)
    //     console.log(req.files)
    // })
}