// we initialize the db
const mongoose = require("mongoose");

// we create the schema (table)
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  about: {
    type: String,
  },
  enrolmentDate: {
    type: Date,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  coverImage: {
    type: Buffer,
    required: true,
  },
  coverImageType: {
    type: String,
    required: true,
  },
  intake: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Intake",
  },
});

// to create a virtual variable
studentSchema.virtual("coverImagePath").get(function () {
  if (this.coverImage != null && this.coverImageType != null) {
    return `data:${
      this.coverImageType
    };charset=utf-8;base64,${this.coverImage.toString("base64")}`;
  }
});

// we export the schema created
module.exports = mongoose.model("Student", studentSchema);
