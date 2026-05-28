const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse incoming JSON payloads cleanly
app.use(express.json());

// 1. Mandatory Custom Middleware: Logs the Request Method and URL to the console
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Incoming Request: Method=${req.method} | URL=${req.url}`);
    next(); // Passes control to the next route handler
});

// Hardcoded initial student data array
let students = [
    { id: 1, name: "Yashavini", department: "CSE", year: "2nd Year" },
    { id: 2, name: "Arun Kumar", department: "ECE", year: "3rd Year" }
];

// 2. GET Route: Fetch all student profiles from the local array
app.get('/students', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Student database records retrieved successfully.",
        count: students.length,
        data: students
    });
});

// 3. POST Route: Add a brand new student profile to the local array
app.post('/students', (req, res) => {
    const { name, department, year } = req.body;

    // Basic data checking
    if (!name || !department || !year) {
        return res.status(400).json({
            success: false,
            message: "Failed to create record. Please provide name, department, and year."
        });
    }

    // Auto-generate incrementing ID key
    const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    
    const newStudent = { id: newId, name, department, year };
    students.push(newStudent);

    res.status(201).json({
        success: true,
        message: "New student record added to the local array memory.",
        data: newStudent
    });
});

// 4. PUT Route: Update an existing student record by matching their numerical ID
app.put('/students/:id', (req, res) => {
    const studentId = parseInt(req.params.id);
    const { name, department, year } = req.body;

    const studentIndex = students.findIndex(s => s.id === studentId);

    if (studentIndex === -1) {
        return res.status(404).json({
            success: false,
            message: `Student profile with ID ${studentId} was not found.`
        });
    }

    // Dynamically update fields if they are provided in the request body
    if (name) students[studentIndex].name = name;
    if (department) students[studentIndex].department = department;
    if (year) students[studentIndex].year = year;

    res.status(200).json({
        success: true,
        message: "Student profile logs modified successfully.",
        data: students[studentIndex]
    });
});

// 5. DELETE Route: Purge a specific student record from the array tracking layout
app.delete('/students/:id', (req, res) => {
    const studentId = parseInt(req.params.id);
    const studentIndex = students.findIndex(s => s.id === studentId);

    if (studentIndex === -1) {
        return res.status(404).json({
            success: false,
            message: `Cannot delete. Student with ID ${studentId} does not exist.`
        });
    }

    // Remove the target item from the array layout
    const deletedStudent = students.splice(studentIndex, 1);

    res.status(200).json({
        success: true,
        message: "Student record purged from local array memory structure successfully.",
        deletedData: deletedStudent[0]
    });
});

// Start the server pipeline environment
app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`  STUDENT LOGISTICS REST API SERVER RUNNING LIVE   `);
    console.log(`  Local Access Endpoint: http://localhost:${PORT}  `);
    console.log(`===================================================`);
});
