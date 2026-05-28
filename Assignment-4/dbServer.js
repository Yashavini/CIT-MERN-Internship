const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// 1. MongoDB Connection Setup via Mongoose
// Replace 'YOUR_MONGODB_ATLAS_CONNECTION_STRING' with your actual Atlas cluster string or use local URI
const MONGO_URI = 'mongodb://127.0.0.1:27017/cit_student_db'; 

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Successfully connected to MongoDB Database Cluster.'))
    .catch((err) => {
        console.error('❌ MongoDB Database connection critical failure:', err.message);
        process.exit(1);
    });

// 2. Mongoose Schema Definition with Strict Field Validation
const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Student name is a mandatory field.'],
        trim: true
    },
    department: {
        type: String,
        required: [true, 'Department tracking classification is required.'],
        trim: true
    },
    year: {
        type: String,
        required: [true, 'Academic year level designation is required.'],
        trim: true
    }
}, {
    timestamps: true // Automatically tracks createdAt and updatedAt logs
});

// Model Creation
const Student = mongoose.model('Student', StudentSchema);

// 3. Express Database CRUD Routes

// CREATE: Add a brand new student profile directly into MongoDB
app.post('/students', async (req, res, next) => {
    try {
        const { name, department, year } = req.body;
        
        const newStudent = new Student({ name, department, year });
        const savedStudent = await newStudent.save();
        
        res.status(201).json({
            success: true,
            message: "Student profile securely committed to MongoDB records.",
            data: savedStudent
        });
    } catch (error) {
        next(error); // Forwards database schema validation errors to global handler
    }
});

// READ: Fetch all student collection entries from MongoDB
app.get('/students', async (req, res, next) => {
    try {
        const studentRecords = await Student.find();
        res.status(200).json({
            success: true,
            message: "All student documents fetched from database successfully.",
            count: studentRecords.length,
            data: studentRecords
        });
    } catch (error) {
        next(error);
    }
});

// UPDATE: Modify an existing student record inside MongoDB using its Hex ObjectId
app.put('/students/:id', async (req, res, next) => {
    try {
        const targetId = req.params.id;
        const updates = req.body;

        // Validates updates against schema rules automatically
        const updatedStudent = await Student.findByIdAndUpdate(targetId, updates, {
            new: true, 
            runValidators: true 
        });

        if (!updatedStudent) {
            return res.status(404).json({
                success: false,
                message: `No database record matches the unique Hex ID: ${targetId}`
            });
        }

        res.status(200).json({
            success: true,
            message: "Student document updated smoothly in database.",
            data: updatedStudent
        });
    } catch (error) {
        next(error);
    }
});

// DELETE: Permanent extraction/purge of a document matching a hex ID
app.delete('/students/:id', async (req, res, next) => {
    try {
        const targetId = req.params.id;
        const deletedStudent = await Student.findByIdAndDelete(targetId);

        if (!deletedStudent) {
            return res.status(404).json({
                success: false,
                message: `Purge target aborted. Unique ID ${targetId} does not exist.`
            });
        }

        res.status(200).json({
            success: true,
            message: "Student profile dropped from MongoDB tracking structure completely.",
            deletedData: deletedStudent
        });
    } catch (error) {
        next(error);
    }
});

// 4. Global Downstream Error Handling Middleware Setup
app.use((err, req, res, next) => {
    console.error('⚠️ Downstream Operational Exception Intercepted:', err.message);
    
    // Specifically catch Mongoose Validation Errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error_type: "SchemaValidationFailure",
            message: err.message
        });
    }

    // Specifically catch Cast Errors (e.g., passing a badly structured Hex ID string)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error_type: "InvalidObjectIdFormat",
            message: "The provided database ID string parameters are malformed."
        });
    }

    // Catch-all fallthrough error
    res.status(500).json({
        success: false,
        message: "An unexpected runtime middleware exception error occurred.",
        error: err.message
    });
});

// Initialize environment pipeline
app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`  MONGODB-INTEGRATED STUDENT API SERVICE IS ACTIVE `);
    console.log(`  Local Endpoint Connection: http://localhost:${PORT}`);
    console.log(`===================================================`);
});
