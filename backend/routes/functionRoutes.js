const express = require("express");
const router = express.Router();

// 1. Core Middlewares
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

// 2. Controller Functions
const { createAssignment, getAllAssignments } = require("../controllers/assignmentController");
const { submitTask, gradeSubmission } = require("../controllers/submissionsController");

// 3. Import Submission Model directly to handle the queue lookup
const Submission = require("../models/submissions"); 

// --- ASSIGNMENT ROUTES ---
// FIX: Support both lowercased and capitalized roles to prevent string mismatch 403 blocks!
router.post("/assignments/new", authMiddleware, authorizeRoles("teacher", "Teacher", "admin", "Admin"), createAssignment);
router.get("/assignments/all", authMiddleware, authorizeRoles("student", "Student", "teacher", "Teacher", "admin", "Admin"), getAllAssignments);


// --- SUBMISSION ROUTES ---

// 🚀 CRITICAL FIX: Move the static "/all" route ABOVE the dynamic "/:submissionId" parameter route
// This prevents Express from treating the word "all" as a database dynamic ID variable!
router.get("/submissions/all", authMiddleware, authorizeRoles("teacher", "Teacher", "admin", "Admin"), async (req, res) => {
    try {
        const submissions = await Submission.find()
            .populate("student", "name email") 
            .populate("assignment", "title")
            .sort({ createdAt: -1 });

        // 🚀 CRITICAL DEBUG LOG
        console.log("=== BACKEND TRACKING SCRIPT ===");
        console.log("Found row count in DB:", submissions.length);
        console.log("Actual database items array:", JSON.stringify(submissions, null, 2));

        return res.status(200).json({
            success: true,
            count: submissions.length,
            submissions
        });
    } catch (e) {
        console.error("Fetch Submissions Error: ", e.message);
        return res.status(500).json({ message: "Internal server error reading queue." });
    }
});

// Only Students can upload their responses
router.post("/submissions/submit", authMiddleware, authorizeRoles("student", "Student"), submitTask);

// Only Teachers can grade individual submissions
router.put("/submissions/:submissionId/grade", authMiddleware, authorizeRoles("teacher", "Teacher"), gradeSubmission);

module.exports = router;