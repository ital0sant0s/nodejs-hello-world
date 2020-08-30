const express = require("express");
const Router = express.Router();
const mysqlConnection = require("../connection");

Router.get("/", (req, res)=>{
    mysqlConnection.query("SELECT * FROM helloworld", (err, rows, fields)=>{
        if(!err)
        {
            res.send(rows);
        }
        else
        {
        console.log("No data found");
        }
    })
})

module.exports = Router;