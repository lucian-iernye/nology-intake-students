const express = require("express");
// router is the controller from MVC
const router = express.Router();

// we import the Book and Author schemas from the book.js file
const Book = require("../models/book");
const Author = require("../models/author");

// we create a variable to accept only image files -
const imageMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/svg+xml",
  "image/gif",
  "image/tiff",
];
/*



*/
// All Books route
router.get("/", async (req, res) => {
  let query = Book.find();
  // logic to show the searched query and hide what doesn't match
  if (req.query.title != null && req.query.title != "") {
    // title comes from the database model -> Book.title
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  // to filter by date : publishedBefore and publishedAfter
  if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
    // lte = less than or equal to - is checking into the database
    query = query.lte("publishDate", req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
    // gte = greater than or equal to - is checking into the database
    query = query.gte("publishDate", req.query.publishedAfter);
  }
  try {
    const books = await query.exec();
    res.render("books/index", {
      books: books,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});
/*



*/
// New Book route
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});
/*



*/
// create Book route
router.post("/", async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
  });

  saveCover(book, req.body.cover);

  try {
    const newBook = await book.save();
    res.redirect(`books/${newBook.id}`);
  } catch {
    renderNewPage(res, book, true);
  }
});
/*



*/
// show book route
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("author").exec();
    res.render("books/show", { book: book });
  } catch (error) {
    res.redirect("/");
  }
});
/*



*/
// edit book route
router.get("/:id/edit", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    renderEditPage(res, book);
  } catch {
    res.redirect("/");
  }
});
/*



*/
// update book route
router.put("/:id", async (req, res) => {
  let book;

  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    if (req.body.cover != null && req.body.cover !== "") {
      saveCover(book, req.body.cover);
    }
    await book.save();
    res.redirect(`/books/${book.id}`);
  } catch (err) {
    console.log(err);
    if (book != null) {
      renderEditPage(res, book, true);
    } else {
      redirect("/");
    }
  }
});
/*



*/
// delete book route
// delete is a node/js method
router.delete("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    // remove is a mongodb method
    await book.remove();
    res.redirect("/books");
  } catch (error) {
    console.log(error);
    if (book != null) {
      res.render("books/show", {
        book: book,
        errorMessage: "Could not remove book!",
      });
    } else {
      res.redirect("/");
    }
  }
});
/*



*/
async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, "new", hasError);
}
/*



*/
async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, "edit", hasError);
}
/*



*/
async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    // if we have an error
    if (hasError) {
      if (form === "edit") {
        params.errorMessage = "Error Updating Book";
      } else {
        params.errorMessage = "Error Creating Book";
      }
    }
    res.render(`books/${form}`, params);
  } catch {
    res.redirect("/books");
  }
}
/*



*/
function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}
/*



*/
// we export the router as a module and we import it as a file in server.js
module.exports = router;
