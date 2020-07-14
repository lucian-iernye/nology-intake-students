const express = require("express");
// router is the controller from MVC
const router = express.Router();
// we import the Author and Book schema
const Author = require("../models/author");
const Book = require("../models/book");
/*


*/
// All authors route
router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null && req.query.name !== "") {
    // we create a new regular expression which will be case insensitive (i)
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOptions);
    res.render("authors/index", {
      authors: authors,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});
/*


*/
// New author route
router.get("/new", (req, res) => {
  res.render("authors/new", { author: new Author() });
});
/*


*/
// create author route
router.post("/", async (req, res) => {
  // we tell to the server which parameter we accept for our Author object
  const author = new Author({
    name: req.body.name,
  });
  try {
    // if there is no error we want to render the user back to the page with all the authors
    const newAuthor = await author.save();
    res.redirect(`authors/${newAuthor.id}`);
  } catch {
    // if there is any error we want to rerender the page again
    res.render("authors/new", {
      author: author,
      errorMessage: "Error creating Author",
    });
  }
});
/*


*/
// edit author
router.get("/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    const books = await Book.find({ author: author.id }).limit(6).exec();
    res.render("authors/show", {
      author: author,
      booksByAuthor: books,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render("authors/edit", { author: author });
  } catch {
    res.redirect("/authors");
  }
});
/*


*/
// update author
router.put("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name;
    await author.save();
    res.redirect(`/authors/${author.id}`);
  } catch {
    if (author == null) {
      res.redirect("/");
    } else {
      res.render("authors/edit", {
        author: author,
        errorMessage: "Error updating Author",
      });
    }
  }
});
/*


*/
// delete author
//in order not to be deleted by google we need to always use delete not get to delete an entry from db
router.delete("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    await author.remove();
    res.redirect("/authors");
  } catch {
    if (author == null) {
      res.redirect("/");
    } else {
      res.redirect(`/authors/${author.id}`);
    }
  }
});

// we export the router as a module and we import it as a file in server.js
module.exports = router;
