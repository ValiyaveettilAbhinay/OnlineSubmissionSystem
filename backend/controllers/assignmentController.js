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
const getAllAssignments = async (req, res) => {
    try {
        // Fetch assignments and populate the creator's name (excluding their password)
        const assignments = await Assignment.find()
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 }); // Newest assignments first

        return res.status(200).json({
            success: true,
            count: assignments.length,
            assignments
        });
    } catch (e) {
        console.error("Get Assignments Error: ", e.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { createAssignment, getAllAssignments };