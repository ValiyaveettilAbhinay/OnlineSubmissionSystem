const express = require("express");
const router = express.Router();

const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");
const { createAssignment, getAllAssignments } = require("../controllers/assignmentController");
const { submitTask, gradeSubmission } = require("../controllers/submissionsController");

// --- ASSIGNMENT ROUTES ---
// 1. Teachers or Admins create the prompts
router.post("/assignments/new", authMiddleware, authorizeRoles("Teacher", "Admin"), createAssignment);
// 2. Students, Teachers, and Admins can see the list of assignments
router.get("/assignments/all", authMiddleware, authorizeRoles("Student", "Teacher", "Admin"), getAllAssignments);

// --- SUBMISSION ROUTES ---
// 3. Only Students can upload their responses
router.post("/submissions/submit", authMiddleware, authorizeRoles("Student"), submitTask);
// 4. Only Teachers can grade individual submissions
router.put("/submissions/:submissionId/grade", authMiddleware, authorizeRoles("Teacher"), gradeSubmission);

module.exports = router;