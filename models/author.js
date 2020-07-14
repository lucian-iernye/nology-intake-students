// we initialize the db
const mongoose = require("mongoose");
const Book = require("./book");

// we create the schema (table)
const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

// this is to prevent to remove the author if he still have books added asociated with that particulary id
authorSchema.pre("remove", function (next) {
  Book.find({ author: this.id }, (err, books) => {
    if (err) {
      next(err);
    } else if (books.length > 0) {
      next(new Error("This author has books still!"));
    } else {
      next();
    }
  });
});

// we export the schema created
module.exports = mongoose.model("Author", authorSchema);
