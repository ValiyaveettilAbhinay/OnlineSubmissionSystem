const Assignment = require("../models/assignments");
const createAssignment = async (req, res) => {
    try {
        const { title, description, dueDate } = req.body;

        // Basic validation
        if (!title || !description || !dueDate) {
            return res.status(400).json({ message: "All fields (title, description, dueDate) are required." });
        }

        // Create assignment using req.user.id populated by authMiddleware
        const newAssignment = new Assignment({
            title,
            description,
            dueDate: new Date(dueDate),
            createdBy: req.user.id // Captured safely from the JWT token
        });

        await newAssignment.save();

        return res.status(201).json({
            success: true,
            message: "Assignment created successfully!",
            assignment: newAssignment
        });
    } catch (e) {
        console.error("Create Assignment Error: ", e.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// 2. GET ALL ASSIGNMENTS (Accessible by Students, Teachers, and Admins)
const Submission = require("../models/submissions"); // <-- Ensure this path points correctly to your submissions model file

const getAllAssignments = async (req, res) => {
    try {
        // 1. Fetch all assignments from MongoDB
        const assignments = await Assignment.find().sort({ createdAt: -1 }).lean();

        // 2. If the request is from a Student, attach their personal submission statuses
        if (req.user.role.toLowerCase() === "student") {
            const compiledAssignments = await Promise.all(
                assignments.map(async (assign) => {
                    // Check if a submission document exists for THIS student and THIS assignment
                    const userSubmission = await Submission.findOne({
                        assignment: assign._id,
                        student: req.user.id // Pulled from your authMiddleware token parsing
                    });

                    // FIX: Convert the Mongoose document to a clean JavaScript object safely
                    const assignmentData = assign.toObject ? assign.toObject() : assign;

                    // Return a combined object to the frontend matching the dashboard expectations
                    return {
                        ...assignmentData,
                        _id: assign._id.toString(),
                        title: assign.title,
                        description: assign.description,
                        dueDate: assign.dueDate,
                        hasSubmitted: !!userSubmission, // Forces explicit boolean true/false
                        grade: userSubmission ? userSubmission.grade : null,
                        feedback: userSubmission ? userSubmission.feedback : ""
                    };
                })
            );

            return res.status(200).json({ success: true, assignments: compiledAssignments });
        }

        // If it's a teacher/admin, just send raw arrays
        return res.status(200).json({ success: true, assignments });
        
    } catch (e) {
        console.error("Fetch Assignments Error: ", e.message);
        return res.status(500).json({ message: "Internal server error fetching assignments." });
    }
};

module.exports = { createAssignment, getAllAssignments };