const express = require("express");
// router is the controller from MVC
const router = express.Router();
// we import the book model
const Book = require("../models/book");

router.get("/", async (req, res) => {
  let books = [];
  try {
    books = await Book.find().sort({ createAt: "desc" }).limit(10).exec();
  } catch {
    books = [];
  }
  res.render("index", { books: books });
});

// we export the router as a module and we import it as a file in server.js
module.exports = router;
