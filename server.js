const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/formsDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Schema & Model
const formSchema = new mongoose.Schema({
  dept_ref: String,
  date: String,
  department: String,
  programme_name: String,
  norms: String,
  start_date: String,
  end_date: String,
  no_of_days: Number,
  programme_for: [String],
  highlights: String,
  totalExpenses: Number,
  expenditure: [
    {
      purpose: String,
      proposed: Number,
      revised: Number,
      actual: Number,
      remarks: String
    }
  ],
  status: { type: String, default: "Pending" }
});

const Form = mongoose.model("Form", formSchema, "Forms");

// API to Submit Form
app.post("/submit", async (req, res) => {
  try {
    let programmeFor = req.body["programme_for[]"];
    if (!programmeFor) {
      programmeFor = [];
    } else if (typeof programmeFor === "string") {
      programmeFor = [programmeFor];
    }

    const expenditure = [];
    for (let i = 1; i <= 2; i++) {
      if (req.body[`exp_purpose${i}`]) {
        expenditure.push({
          purpose: req.body[`exp_purpose${i}`] || "",
          proposed: Number(req.body[`proposed${i}`]) || 0,
          revised: Number(req.body[`revised${i}`]) || 0,
          actual: Number(req.body[`actual${i}`]) || 0,
          remarks: req.body[`remarks${i}`] || ""
        });
      }
    }

    const newForm = new Form({
      dept_ref: req.body.dept_ref,
      date: req.body.date,
      department: req.body.department,
      programme_name: req.body.programme_name,
      norms: req.body.norms,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      no_of_days: Number(req.body.no_of_days),
      programme_for: programmeFor,
      highlights: req.body.highlights,
      totalExpenses: Number(req.body.totalExpenses) || 0,
      expenditure: expenditure,
      status: "Pending"
    });

    await newForm.save();
    console.log("✅ Form Saved Successfully");
    res.json({ message: "Form submitted successfully!" });
  } catch (error) {
    console.error("❌ Error saving form:", error);
    res.status(500).json({ message: "Error saving form", error });
  }
});

// Start the Server
const PORT = 5500;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
