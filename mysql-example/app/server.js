const express = require("express");
const bodyParser = require("body-parser");
const mysqlConnection = require("./connection");
const HelloworldRoutes = require("./routes/helloworld");

var app = express();
app.use(bodyParser.json());

app.use("/helloworld", HelloworldRoutes);

app.listen(3000);