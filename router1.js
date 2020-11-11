const mysql = require("mysql2")
let conn_info = {
    host : 'localhost',
    port : 3320,
    user : 'root',
    password : '1234',
    database : 'mydb'
}

module.exports = function(app){
    app.get('/',function(req, res){
        res.render('index.ejs')
    })
    
}