const mongoose = require('mongoose');
require('dotenv').config();

//define mongoose url
const mongoURL = process.env.MONGODB_LOCAL;   

//setup mongodb connection
mongoose.connect(mongoURL);

//default connection object represent the mongodb connection
const db = mongoose.connection;

//define event listener for database connection
db.on('connected', ()=> {
    console.log('connected to the mongodb server');
});

db.on('error', (err)=>{
    console.log('mongodb conncetion error', err);
});

db.on('disconnected', ()=>{
    console.log('mongodb disconnected');
})

//export the database connection
module.exports = db;