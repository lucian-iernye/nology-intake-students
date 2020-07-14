const express = require("express");
// router is the controller from MVC
const router = express.Router();
// we import the student model
const Student = require("../models/student");

router.get("/", async (req, res) => {
  let students = [];
  try {
    students = await Student.find().sort({ createAt: "desc" }).limit(10).exec();
  } catch {
    students = [];
  }
  res.render("index", { students: students });
});

// we export the router as a module and we import it as a file in server.js
module.exports = router;
