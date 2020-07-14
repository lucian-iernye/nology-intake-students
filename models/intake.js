// we initialize the db
const mongoose = require("mongoose");
const Student = require("./student");

// we create the schema (table)
const intakeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

// this is to prevent to remove the intake if he still have students added asociated with that particulary id
intakeSchema.pre("remove", function (next) {
  Student.find({ intake: this.id }, (err, students) => {
    if (err) {
      next(err);
    } else if (students.length > 0) {
      next(new Error("This intake has students still!"));
    } else {
      next();
    }
  });
});

// we export the schema created
module.exports = mongoose.model("Intake", intakeSchema);
