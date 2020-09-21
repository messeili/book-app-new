'use strict'

//dependencies
const dotenv = require('dotenv').config();
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const cors = require('cors');
const superagent = require('superagent');

const app = express();
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');


//routes
app.get('/', mainRouteHandler);
app.get('/searches/new', newSearchHandler);
app.post('/searches/show', showSearchesHandler);
app.post('/addBooks', addBookHandler);
app.get('/savedBooks', savedBooksHandler);
app.get('/book/:id', bookDetailsHandler);
app.delete('/deleteBook/:id', deleteBookHandler)
app.put('/updateBook/:id', updateBookHandler)



//functions
function mainRouteHandler(req, res) {
    let SQL = `SELECT image_url,title,author FROM book1;`
    client.query(SQL).then((results) => {
        res.render('pages/index', { data: results.rows })
    })


}

function newSearchHandler(req, res) {
    res.render('pages/newSearch')
}

function showSearchesHandler(req, res) {
    let { search, titleAuthor } = req.body;
    let url = `https://www.googleapis.com/books/v1/volumes?q=+${titleAuthor}:${search}`
    superagent.get(url).then((results) => {
        let apiData = results.body.items.map(obj => {
            return new Books(obj);
        })
        res.render('pages/searchResults', { data: apiData })
    })
}

function addBookHandler(req, res) {
    let { image_url, title, author, isbn, description, categories } = req.body;
    let SQL = `INSERT INTO book1 (image_url,title,author,isbn,description,categories) VALUES ($1,$2,$3,$4,$5,$6);`
    let VALUES = [image_url, title, author, isbn, description, categories];
    client.query(SQL, VALUES).then(() => {
        res.redirect('/savedBooks')
    })
}

function savedBooksHandler(req, res) {
    let SQL = `SELECT * FROM book1;`
    client.query(SQL).then((results) => {
        res.render('pages/savedBooks', { data: results.rows })
    })
}




function bookDetailsHandler(req, res) {
    let id = req.params.id;
    let SQL = `SELECT * FROM book1 WHERE id=$1;`
    let VALUES = [id];
    client.query(SQL, VALUES).then((results) => {
        let SQL1 = `SELECT DISTINCT categories FROM book1;`
        client.query(SQL1).then((results2) => {
            res.render('pages/bookDetails', { data: results.rows[0], data2: results2.rows })
        })

    })
}

function deleteBookHandler(req, res) {
    let id = req.params.id;
    let SQL = `DELETE FROM book1 WHERE id=$1;`
    let VALUES = [id];
    client.query(SQL, VALUES).then(() => {
        res.redirect('/savedBooks')
    })
}

function updateBookHandler(req, res) {
    let { image_url, title, author, isbn, description, categories } = req.body;
    let id = req.params.id;
    let SQL = `UPDATE book1 SET image_url=$1,title=$2,author=$3,isbn=$4,description=$5,categories=$6 WHERE id=$7;`
    let VALUES = [image_url, title, author, isbn, description, categories, id];
    client.query(SQL, VALUES).then(() => {
        res.redirect(`/book/${id}`)
    })
}




//constructor
function Books(obj) {
    this.title = obj.volumeInfo.title ? obj.volumeInfo.title : 'there is no title';
    this.author = obj.volumeInfo.authors ? obj.volumeInfo.authors : 'there is no authors';
    this.isbn = obj.volumeInfo.industryIdentifiers ? obj.volumeInfo.industryIdentifiers[0].identifier : 'there is no isbn';
    this.image_url = obj.volumeInfo.imageLinks ? obj.volumeInfo.imageLinks.thumbnail : 'there is no image';
    this.description = obj.volumeInfo.description ? obj.volumeInfo.description : 'there is no descriptions';
    this.categories = obj.volumeInfo.categories ? obj.volumeInfo.categories : 'no category'


}



//port listening
client.connect().then(() => {
    app.listen(PORT, () => {
        console.log(`Listening to PORT:${PORT}`);
    })
})