'use strict';

const express = require('express');
const bodyParser = require("body-parser");
const methodOverride = require('method-override');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded());
app.set("view engine", "ejs");

let collection = null;

const MongoClient = require("mongodb").MongoClient;
const MONGODB_URI = "mongodb://127.0.0.1:27017/url_shortener";

console.log(`Connecting to MongoDB running at: ${MONGODB_URI}`);

MongoClient.connect(MONGODB_URI, (err, db) => {
  if (err) {
    console.log('Could not connect! Unexpected error. Details below.');
    throw err;
  }
  console.log('Connected to the database!');
  collection = db.collection("urls");
});

function generateRandomString() {
  let letterPool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    if (Math.floor(Math.random() * 2)) {
      result += (Math.floor(Math.random() * 9));
    } else {
      result += (letterPool[Math.floor(Math.random() * letterPool.length)]);
    }
  }
  return result;
}

app.get('/', (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  collection.find().toArray((err, results) => {
    res.render("urls_index", { urlD: results });
  });
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  collection.insert( {shortURL: newShortURL, longURL: req.body.longURL} );
  res.redirect(`/urls/${newShortURL}`);
});

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  collection.find( {shortURL: shortURL} ).toArray((err, results) => {
    res.render("urls_show", { shortURL: shortURL, longURL: results[0].longURL });
  });
});

app.get("/u/:shortURL", (req, res) => {
  collection.find( {shortURL: req.params.shortURL} ).toArray((err, results) => {
    res.redirect(results[0].longURL);
  });
});


app.delete("/urls/:id", (req, res) => {
   collection.deleteOne( {shortURL: req.params.id } );
  res.redirect("/urls");
});

app.put("/urls/:id", (req, res) => {
  collection.updateOne( {shortURL: req.params.id},
  {shortURL: req.params.id,
  longURL: req.body.longURL} );
  res.redirect("/urls");
});

app.listen(PORT);
console.log(`server listening on: ${PORT}`);







