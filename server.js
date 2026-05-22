const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());


// Middleware
app.use((req, res, next) => {
  console.log(`Request Method: ${req.method}`);
  next();
});


// Student Array
let students = [
  {
    id: 1,
    name: "Yash",
    department: "CSE"
  }
];


// GET API
app.get("/students", (req, res) => {
  res.json(students);
});


// POST API
app.post("/students", (req, res) => {

  const newStudent = {
    id: students.length + 1,
    name: req.body.name,
    department: req.body.department
  };

  students.push(newStudent);

  res.json({
    message: "Student added",
    student: newStudent
  });
});


// PUT API
app.put("/students/:id", (req, res) => {

  const id = parseInt(req.params.id);

  const student = students.find(s => s.id === id);

  if (!student) {
    return res.status(404).json({
      message: "Student not found"
    });
  }

  student.name = req.body.name || student.name;
  student.department = req.body.department || student.department;

  res.json({
    message: "Student updated",
    student
  });
});


// DELETE API
app.delete("/students/:id", (req, res) => {

  const id = parseInt(req.params.id);

  students = students.filter(s => s.id !== id);

  res.json({
    message: "Student deleted"
  });
});


// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});