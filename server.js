if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
// to create and use ejs html layouts
const expressLayouts = require("express-ejs-layouts");
// to access the form data from the html
const bodyParser = require("body-parser");
const methodOverride = require("method-override");

// we import the index file from the routes
const indexRouter = require("./routes/index");
// we import the intakes file from the routes
const intakeRouter = require("./routes/intakes");
// we import the students file from the routes
const studentRouter = require("./routes/students");

app.set("view engine", "ejs");
// we set to the app the views folder inside root
app.set("views", __dirname + "/views");
// we set to the app the file layour inside the layouts folder
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(methodOverride("_method"));
app.use(express.static("public"));
// we tell express how to use body-parser and we create a file size limit
app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));

// we import mongoose/mongodb
const mongoose = require("mongoose");
// we setup our connection to the db
mongoose.connect(process.env.DATABASE_URL, {
  // we need to use this useNewUrlParser to tell mongoose to the new way of accessing the mongodb - by default it's using an older way. maybe in new versions this function was added already to be by default
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Mongoose!"));

app.use("/", indexRouter);
app.use("/intakes", intakeRouter);
app.use("/students", studentRouter);

app.listen(process.env.PORT || 3000, () => {
  console.log("Running on port 3000");
});
