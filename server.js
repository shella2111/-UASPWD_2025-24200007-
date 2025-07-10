const http = require('http');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const port = 8000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sewaalatbersih'
});

db.connect((err) => {
  if(err){
    console.log("koneksi database gagal");
    process.exit();
  }
  console.log("database terhubung!");
});

const server = http.createServer((req, res) => {
  if(req.method === 'GET'){
    const filePath = req.url === '/' ? '/index.html' : req.url;
    const fullPath = path.join(publicDir, filePath);
    fs.readFile(fullPath, (err, content) => {
      const ext = path.extname(fullPath);
      const contentType = ext === '.css' ? 'text/css':
                          ext === '.js' ? 'text/javascript':
                          ext === '.html' ? 'text/html' : 'text/plain';
      res.writeHead(200, { 'content-type': contentType});
      res.end(content);
    });

  }else if(req.method === 'POST' && req.url === '/contact'){
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const parsed = parse(body);
      const {name, email, item} = parsed;
      const sql = 'insert into context (name, email, item) values(?, ?, ?)';
      db.query(sql, [name, email, item], (err) => {
        if(err){
          console.log("gagal menyimpan ke database");
          res.writeHead(500, {'content-type': 'text/plain'});
          return res.end("gagal menyimpan ke database");
        }

        res.writeHead(200, {'content-type': 'text/plain'});
        return res.end('berhasil menyimpan ke database!');
      });
    });
  }
});

server.listen(port, () => console.log(`Server running at http://localhost:${port}`));