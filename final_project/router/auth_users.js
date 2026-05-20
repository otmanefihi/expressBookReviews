const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => user.username === username);
  return userswithsamename.length > 0;
}

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => user.username === username && user.password === password);
  return validusers.length > 0;
}

// Tâche 7 : Connexion de l'utilisateur enregistré
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    // Génération du Token JWT valide pendant 1 heure
    let accessToken = jwt.sign({ data: username }, 'access', { expiresIn: 60 * 60 });
    
    // Sauvegarde des données d'authentification dans la session active
    req.session.authorization = { accessToken, username };
    
    return res.status(200).json({ message: "Customer successfully logged in" });
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Tâche 8 : Ajouter ou modifier l'avis d'un livre
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review || req.query.review;
  const username = req.session.authorization.username;

  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }

  if (books[isbn]) {
    books[isbn].reviews[username] = review;
    return res.status(200).json({
      message: `The review for the book with ISBN ${isbn} has been added/updated.`,
      reviews: books[isbn].reviews
    });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Tâche 9 : Supprimer l'avis d'un livre (Seulement celui posté par l'utilisateur connecté)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (books[isbn]) {
    if (books[isbn].reviews[username]) {
      delete books[isbn].reviews[username];
      return res.status(200).json({ 
        message: `Review for the ISBN ${isbn} posted by the user ${username} deleted.` 
      });
    } else {
      return res.status(404).json({ message: "No review found from this user for this book" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
