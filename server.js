'use strict';

var express = require('express');
var cors = require('cors');
const app = express();
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const fs  = require('fs');
const multer = require('multer');
const Gridfs = require('multer-gridfs-storage');
const bodyparser = require('body-parser');
const Grid = require('gridfs-stream');

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
const conn = mongoose.createConnection(process.env.MONGO_URI,{ useNewUrlParser: true, useUnifiedTopology: true } );

let gfs;

//CONNECT GFS TO DATABASE
conn.once('open', ()=> {
gfs = Grid(conn.db,mongoose.mongo);
gfs.collection('files'); //DATABASE COLLECTION
});


const storage = new Gridfs({
url: process.env.MONGO_URI, //DATABASE URL
file:(req,file) =>{ //ACCEPT A FILE PARAMETER
   return new Promise((resolve,reject) =>{
   crypto.randomBytes(16, (err, buf)=>{
  if(err) {
      return reject(err); //IF ERROR
  }
  
  const filename = file.originalname; //GET ORIGINAL NAME OF FILE e.g. "module_3.txt"
  const fileinfo = {   //GET FILE INFO
      filename:filename,
      bucketName:'userdocs' //IF YOU CHECK THE DATABASE, IT DOES NOT ADD IT TO THE "FILES" COLLECTION, RATHER THE USERDOCS.FILES COLLECTION
       };
       resolve(fileinfo);
     });
   });
  }
});
const upload = multer({ storage} );


app.get('/', function (req, res) {
     res.sendFile(process.cwd() + '/views/index.html');
  });

app.post('/api/fileanalyse', upload.single('upfile'), function(req, res){ //USE UPLOAD FUNCTION
  res.json({ "file": req.file.originalname , type: req.file.contentType, size: req.file.size + " bytes"}); //Return JSON of file METADATA
});

app.listen(process.env.PORT || 3000, function () {
  console.log('Node.js listening ...');
});
