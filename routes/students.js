const express = require("express");
// router is the controller from MVC
const router = express.Router();

// we import the student and intake schemas from the student.js file
const Student = require("../models/student");
const Intake = require("../models/intake");

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
// All Students route
router.get("/", async (req, res) => {
  let query = Student.find();
  // logic to show the searched query and hide what doesn't match
  if (req.query.title != null && req.query.title != "") {
    // title comes from the database model -> student.title
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
    const students = await query.exec();
    res.render("students/index", {
      students: students,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});
/*



*/
// New Student route
router.get("/new", async (req, res) => {
  renderNewPage(res, new Student());
});
/*



*/
// create Student route
router.post("/", async (req, res) => {
  const student = new Student({
    title: req.body.title,
    intake: req.body.intake,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
  });

  saveCover(student, req.body.cover);

  try {
    const newStudent = await student.save();
    res.redirect(`students/${newStudent.id}`);
  } catch {
    renderNewPage(res, student, true);
  }
});
/*



*/
// show student route
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("intake")
      .exec();
    res.render("students/show", { student: student });
  } catch (error) {
    res.redirect("/");
  }
});
/*



*/
// edit student route
router.get("/:id/edit", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    renderEditPage(res, student);
  } catch {
    res.redirect("/");
  }
});
/*



*/
// update student route
router.put("/:id", async (req, res) => {
  let student;

  try {
    student = await Student.findById(req.params.id);
    student.title = req.body.title;
    student.intake = req.body.intake;
    student.publishDate = new Date(req.body.publishDate);
    student.pageCount = req.body.pageCount;
    student.description = req.body.description;
    if (req.body.cover != null && req.body.cover !== "") {
      saveCover(student, req.body.cover);
    }
    await student.save();
    res.redirect(`/students/${student.id}`);
  } catch (err) {
    console.log(err);
    if (student != null) {
      renderEditPage(res, student, true);
    } else {
      redirect("/");
    }
  }
});
/*



*/
// delete student route
// delete is a node/js method
router.delete("/:id", async (req, res) => {
  let student;
  try {
    student = await Student.findById(req.params.id);
    // remove is a mongodb method
    await student.remove();
    res.redirect("/students");
  } catch (error) {
    console.log(error);
    if (student != null) {
      res.render("students/show", {
        student: student,
        errorMessage: "Could not remove student!",
      });
    } else {
      res.redirect("/");
    }
  }
});
/*



*/
async function renderNewPage(res, student, hasError = false) {
  renderFormPage(res, student, "new", hasError);
}
/*



*/
async function renderEditPage(res, student, hasError = false) {
  renderFormPage(res, student, "edit", hasError);
}
/*



*/
async function renderFormPage(res, student, form, hasError = false) {
  try {
    const intakes = await Intake.find({});
    const params = {
      intakes: intakes,
      student: student,
    };
    // if we have an error
    if (hasError) {
      if (form === "edit") {
        params.errorMessage = "Error Updating Student";
      } else {
        params.errorMessage = "Error Creating Student";
      }
    }
    res.render(`students/${form}`, params);
  } catch {
    res.redirect("/students");
  }
}
/*



*/
function saveCover(student, coverEncoded) {
  if (coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    student.coverImage = new Buffer.from(cover.data, "base64");
    student.coverImageType = cover.type;
  }
}
/*



*/
// we export the router as a module and we import it as a file in server.js
module.exports = router;
