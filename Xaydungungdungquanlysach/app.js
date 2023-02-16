const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

const app = express();
const port = 3000;

app.use(fileUpload());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'book_manager'
});

connection.connect(function (err) {
  if (err) throw err.stack;
  else console.log('connection established');
})


app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', './views');


app.get('/books/create', (req, res) => {
  res.render('create');
});

app.post('/books/create', (req, res) => {
  const { name, price, status, author } = req.body;
  let image = req.files.image;
  image.mv('./public/images/' + image.name);
  const sql = `INSERT INTO books (name, price, status, author, image) VALUES ?`;
  const values = [[name, price, status, author, image.name]];




  connection.query(sql, [values], (err, result) => {
    if (err) throw err.stack;
    else {
      res.redirect('/books');
    }
  })
});

app.get('/books', (req, res) => {
  let offset = req.query.offset || 0;
  const sql = `select * from books limit 5 offset ${offset}`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    else {
      res.render('index', { books: result });
    }
  })
});

app.get('/books/:id/delete', (req, res) => {
  const idbook = req.params.id;
  const sql = `DELETE FROM books WHERE id = ` + idbook;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    else {
      res.redirect('/books')
    }
  })
});

app.get('/books/:id/update', (req, res) =>{
  const idbook = req.params.id;
  const sql = `SELECT * FROM books WHERE id = ` + idbook;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    else {
      res.render('update', { book: result[0] });
    }
  })
});

app.post('/books/:id/update', (req, res) => {
  const idbook = req.params.id;
  const sql = `UPDATE books SET name = ?, price = ?, status = ?, author = ? WHERE id =?`
  const {name, price, status, author } = req.body;
  const values = [name, price, status, author, idbook];
  connection.query(sql, values, (err, result) => {
    if (err) throw err;
    else {
      res.redirect('/books')
    }
  })
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}/books`);
})