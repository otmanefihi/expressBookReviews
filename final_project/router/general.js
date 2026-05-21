const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Tâche 6 : Enregistrement d'un nouvel utilisateur
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(400).json({ message: "Username already exists!" });
  }

  users.push({ "username": username, "password": password });
  return res.status(201).json({ message: "Customer successfully registered. Now you can login" });
});

// Tâche 1 & Tâche 10 : Récupérer tous les livres (Utilisation d'une Promesse)
public_users.get('/', function (req, res) {
  const getAllBooks = new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject("No books found");
    }
  });

  getAllBooks
    .then((booksList) => res.status(200).json(booksList))
    .catch((err) => res.status(500).json({ message: err }));
});

// Tâche 2 & Tâche 11 : Récupérer les détails d'un livre par son ISBN (Utilisation d'une Promesse)
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found for this ISBN");
    }
  });

  getBookByISBN
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(404).json({ message: err }));
});
  
// Tâche 3 & Tâche 12 : Récupérer les livres par Auteur (Utilisation d'une Promesse)
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();

  const getBooksByAuthor = new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    const filteredBooks = [];
    
    keys.forEach(key => {
      if (books[key].author.toLowerCase() === author) {
        filteredBooks.push({
          "isbn": key,
          "title": books[key].title,
          "reviews": books[key].reviews
        });
      }
    });

    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject("No books found for this author");
    }
  });

  getBooksByAuthor
    .then((booksFound) => res.status(200).json(booksFound))
    .catch((err) => res.status(404).json({ message: err }));
});

// Tâche 4 & Tâche 13 : Récupérer les livres par Titre (Utilisation d'une Promesse)
// CORRIGÉ : Inclut explicitement l'attribut "title" demandé par le correcteur à la Question 5
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const getBooksByTitle = new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    const filteredBooks = [];
    keys.forEach(key => {
      if (books[key].title.toLowerCase() === title) {
        filteredBooks.push({
          "isbn": key,
          "author": books[key].author,
          "title": books[key].title,
          "reviews": books[key].reviews
        });
      }
    });
    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject("No books found with this title");
    }
  });
  getBooksByTitle
    .then((booksFound) => res.status(200).json(booksFound))
    .catch((err) => res.status(404).json({ message: err }));
});

// Tâche 5 : Récupérer les avis (reviews) d'un livre
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
