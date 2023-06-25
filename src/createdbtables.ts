import mysql from 'mysql'

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "aspiresub"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "CREATE TABLE loans (id INT AUTO_INCREMENT PRIMARY KEY, userId VARCHAR(255) NOT NULL, loanId VARCHAR(255) NOT NULL, amount DECIMAL(10, 2) NOT NULL, term INT NOT NULL, applicationDate DATETIME NOT NULL, status VARCHAR(255) NOT NULL);";
    var sql2 = "CREATE TABLE repayments (id INT AUTO_INCREMENT PRIMARY KEY, loanId VARCHAR(255) NOT NULL, amount DECIMAL(10, 2) NOT NULL, paymentDate DATETIME NOT NULL, status VARCHAR(255) NOT NULL);";
    
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");
    });

    con.query(sql2, function (err, result) {
        if (err) throw err;
        console.log("Table created");
    });
});
