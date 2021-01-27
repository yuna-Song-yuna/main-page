

//라우터 파일(login.js)
passport.use(new LocalStrategy({	//👈3️⃣ LocalStrategy를 사용합니다.
    usernameField: 'username',      //usernameField와 passwordField는 원하는 값으로 변경이 가능합니다.
    passwordField: 'password'       //form태그의 name과 동일하게 작성해야 합니다.
}, function(username, password, done){	    //👈4️⃣username과 password를 받아서 db값과 비교를 시작합니다.
    let conn = mysql.createConnection(conn_info);
    conn.query('select id from guest where id=?', username, (err, result)=>{
        if(result.length >=1){
            var user = {
                id: username
            }        
            return done(null, user)     //done(에러, 성공했을 때 값, 사용자정의 메시지) 
        }else return done(null, false)  //성공적으로 user 값을 return했다면 이 값은 5번으로 들어갑니다.
    })
}
))

//2️⃣👇요청이 들어오면 LocalStrategy가 실행됩니다.
app.post('/login/local', passport.authenticate('local', {
    successRedirect: '/',           //7️⃣👈 세션 인증 성공시/실패시 경로를 설정합니다.
    failureRedirect: '/login'
})
)

passport.serializeUser(function(user, done){    //5️⃣👈return값을 받아서 세션 생성!
    done(null, user.id)
})

passport.deserializeUser(function(req, user, done){ //6️⃣👈serealizeUser의 세션값 중에 필요한 값인 user.id값만 받아옵니다.
    done(null, user)                                //그 값은 req.user에 담겨 사용되고 새로고침시 마다 실행, 사용됩니다.
})
