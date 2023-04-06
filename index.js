const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const fs = require('fs');

const storageLoc = multer.diskStorage({
    destination: (req, file, cb) => {// uploaded file destination
      cb(null, './uploadedvideos/');
    },
    filename: (req, file, cb) => {//uploaded file name
      cb(null, file.originalname);
    }
  });

//creating multer instance for video uploads
const upload = multer({ storage: storageLoc });
// Upload endpoint
app.post('/upload', upload.single('video'), (req, res) => {//it will ensure one video is uploaded at a time
    res.send('Video uploaded successfully');
  },(err,req,res,next)=>{
    res.status(400).send({error: error.message})
  });

app.get('/stream/:file',(req,res)=>{
    const path = `uploadedvideos/${req.params.file}`;//storing the path of the file
    const stat = fs.statSync(path);//synchronously return information about the file
    const fileSize = stat.size;//getting the size of the file
    const range = req.headers.range; //storing the range of the file
    if (range) {
        const parts = range.replace(/bytes=/, '').split('-'); 
        const start = parseInt(parts[0], 10);//converting the string to integer
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
    
        const chunksize = (end-start) + 1;//amount of partial data
        const file = fs.createReadStream(path, {start, end});//here it read the file/stream
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,//it allow video player to knows how far along 
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        };
    
        res.writeHead(206, head);//status code 206 for partial content,  sends a response header to the request
        file.pipe(res);
      }else{
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
          };
          res.writeHead(200, head);//status code 200 for everything is okay
          fs.createReadStream(path).pipe(res);
      }

})

app.get('/download/:file', (req, res) => {
    const path = `./uploads/${req.params.file}`;
    res.download(path);
  });

  app.listen(5000,()=>{
    console.log("serving on 5000");
});