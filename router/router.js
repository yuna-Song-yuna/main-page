const mysql = require("mysql2");
var bodyParser = require("body-parser")
var parser = bodyParser.urlencoded({extended:false});
var fileupload = require("express-fileupload");
const { createConnection } = require("mysql2/promise");


let conn_info = {
    host : 'localhost',
    port : 3320,
    user : 'root',
    password : '1234',
    database : 'product'
}



module.exports = function(app){
    app.get('/mypage', function(req, res){
        if(!req.user){
            res.render('login.ejs')
        }else{
            let conn=mysql.createConnection(conn_info);
            conn.query('select id,role from guest where id=?',[req.user],(err, result)=>{
                console.log(err)
                if(result[0].role == 'buyer'){
                    res.render('mypage_buyer.ejs',{session:req.user})
                }else{
                    //res.render('mypage_seller.ejs',{session:req.session.passport})
                    res.render('mypage_seller.ejs',{session:req.user})
                }
            })
        }
    })

    app.get('/regi_item', function(req, res){
        if(!req.user){
            res.render('index.ejs')
        }
        res.render('regi_item.ejs',{session:req.session.passport})
    })

    //판매 등록
    app.post('/product',parser, function(req, res){
        if(!req.files){     //이미지를 하나라도 전달받으면 등록안한 이미지는 undefined로 전송이 됨 => 에러 안나고 진행
                            //근데 이미지를 둘다 전송 안하면 null로 전송됨 => 에러남
            var sell_image = 'undefined'
            var content_image = 'undefined'
        }else{
            var sell_image = req.files.sell_image;
            var content_image = req.files.content_image;    
        }

        // console.log('req.files.sell_image:',req.files.sell_image)
        // console.log('req.files.content_image:',req.files.content_image)

        let conn = mysql.createConnection(conn_info);
        if(!req.files){ //이미지 둘 다 등록 안한 경우
            let sql = 'insert into sell_product (id, title, price, category, start_date, content_text) values (?,?,?,?,?,?)'
            input_data = [req.session.passport.user, req.body.title, req.body.price, req.body.category, req.body.start_date, req.body.content_text]
            conn.query(sql, input_data, (err, result)=>{
                console.log(input_data)
                console.log(err)
                res.redirect('/')
            })
            console.log('아이디:',req.session.passport.user)
            console.log(req.body.category)      //name='category' <option>의 value값이 들어옴
            console.log(req.body.start_date)
        }else if(!req.files.sell_image){    //썸네일 이미지 등록 안한 경우
            content_image.mv(__dirname+'/public/image/uploads/'+content_image.name) //서버에 이미지 저장

            let sql = 'insert into sell_product (id, title, price, category, start_date, content_text, content_image) values (?,?,?,?,?,?,?)'
            input_data = [req.session.passport.user, req.body.title, req.body.price, req.body.category, req.body.start_date, req.body.content_text, content_image.name]
            conn.query(sql, input_data, (err, result)=>{
                console.log(err)
                res.redirect('/')
            })
        }else if(!req.files.content_image){ //상세내용 이미지 등록 안한 경우
            sell_image.mv(__dirname+'/public/image/uploads/'+sell_image.name)

            let sql = 'insert into sell_product (id, title, price, category, start_date, content_text, thumbnail_image) values (?,?,?,?,?,?,?)'
            input_data = [req.session.passport.user, req.body.title, req.body.price, req.body.category, req.body.start_date, req.body.content_text, sell_image.name]
            conn.query(sql, input_data, (err, result)=>{
                console.log(err)
                res.redirect('/')
            })
        }else{  //이미지 모두 등록 한경우
            sell_image.mv(__dirname+'/public/image/uploads/'+sell_image.name)
            content_image.mv(__dirname+'/public/image/uploads/'+content_image.name)

            let sql = 'insert into sell_product (id, title, price, category, start_date, content_text, content_image, thumbnail_image) values (?,?,?,?,?,?,?,?)'
            input_data = [req.session.passport.user, req.body.title, req.body.price, req.body.category, req.body.start_date, req.body.content_text, content_image.name, sell_image.name]
            conn.query(sql, input_data, (err, result)=>{
                console.log(err)
                res.redirect('/')
            })
        }
        
        console.log(req.body)
        console.log(req.files)
    })

    // 상품 검색
    app.get('/search', function(req, res){
        //var data = new Set();
        //var search_data = req.query.search;
        //search_data = search_data.split(" ")
        let conn = mysql.createConnection(conn_info)
        var data = req.query.search
        data = '%'+data+'%'

        conn.query('select title from sell_product where title like ?', data, (err, result)=>{
            res.send(result)
        })
    })

}