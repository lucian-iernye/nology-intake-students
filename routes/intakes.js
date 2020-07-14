const express = require("express");
// router is the controller from MVC
const router = express.Router();
// we import the Intake and Student schema
const Intake = require("../models/intake");
const Student = require("../models/student");
/*


*/
// All intakes route
router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null && req.query.name !== "") {
    // we create a new regular expression which will be case insensitive (i)
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const intakes = await Intake.find(searchOptions);
    res.render("intakes/index", {
      intakes: intakes,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});
/*


*/
// New intake route
router.get("/new", (req, res) => {
  res.render("intakes/new", { intake: new Intake() });
});
/*


*/
// create intake route
router.post("/", async (req, res) => {
  // we tell to the server which parameter we accept for our intake object
  const intake = new Intake({
    name: req.body.name,
    location: req.body.location,
  });
  try {
    // if there is no error we want to render the user back to the page with all the intakes
    const newIntake = await intake.save();
    res.redirect(`intakes/${newIntake.id}`);
  } catch {
    // if there is any error we want to rerender the page again
    res.render("intakes/new", {
      intake: intake,
      errorMessage: "Error creating Intake",
    });
  }
});
/*


*/
// edit intake
router.get("/:id", async (req, res) => {
  try {
    const intake = await Intake.findById(req.params.id);
    const students = await Student.find({ intake: intake.id }).limit(6).exec();
    res.render("intakes/show", {
      intake: intake,
      studentsByIntake: students,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const intake = await Intake.findById(req.params.id);
    res.render("intakes/edit", { intake: intake });
  } catch {
    res.redirect("/intakes");
  }
});
/*


*/
// update intake
router.put("/:id", async (req, res) => {
  let intake;
  try {
    intake = await Intake.findById(req.params.id);
    intake.name = req.body.name;
    intake.location = req.body.location;
    await intake.save();
    res.redirect(`/intakes/${intake.id}`);
  } catch {
    if (intake == null) {
      res.redirect("/");
    } else {
      res.render("intakes/edit", {
        intake: intake,
        errorMessage: "Error updating Intake",
      });
    }
  }
});
/*


*/
// delete intake
//in order not to be deleted by google we need to always use delete not get to delete an entry from db
router.delete("/:id", async (req, res) => {
  let intake;
  try {
    intake = await Intake.findById(req.params.id);
    await intake.remove();
    res.redirect("/intakes");
  } catch {
    if (intake == null) {
      res.redirect("/");
    } else {
      res.redirect(`/intakes/${intake.id}`);
    }
  }
});

// we export the router as a module and we import it as a file in server.js
module.exports = router;
