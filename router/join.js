const mysql = require("mysql2");
var bodyParser = require("body-parser");

let conn_info = {
    host : 'localhost',
    port : 3320,
    user : 'root',
    password : '1234',
    database : 'product'
}

module.exports = function(app){
    app.get('/join', function(req, res){
        res.render('join.ejs')
    })

    app.post('/join', function(req, res){
        console.log('id:', req.body.id, 'password:', req.body.password)
        let conn = mysql.createConnection(conn_info);
        conn.query('insert into guest (id, password) values (?,?)', [req.body.id, req.body.password], (err, result)=>{
            res.render('login.ejs')
        })
    })
}