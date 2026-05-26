const Submission = require("../models/submissions");
const Assignment = require("../models/assignments");

// 1. SUBMIT AN ASSIGNMENT (Students Only)
const submitTask = async (req, res) => {
    try {
        const { assignmentId, submissionData } = req.body;

        if (!assignmentId || !submissionData) {
            return res.status(400).json({ message: "Assignment ID and submission content are required." });
        }

        // Verify that the target assignment actually exists
        const assignmentExists = await Assignment.findById(assignmentId);
        if (!assignmentExists) {
            return res.status(404).json({ message: "The assignment you are trying to submit to does not exist." });
        }

        // 🛠️ IDENTITY EXTRACTION GUARD: Accommodates both req.user.id and req.user._id token variations
        const verifiedStudentId = req.user?.id || req.user?._id;

        if (!verifiedStudentId) {
            return res.status(401).json({ message: "Unauthorized: User session token identification string not resolved." });
        }

        // Prevent duplicate submissions from the same student for the same assignment
        const existingSubmission = await Submission.findOne({
            assignment: assignmentId,
            student: verifiedStudentId
        });

        if (existingSubmission) {
            return res.status(409).json({ message: "You have already submitted work for this assignment. Try updating it instead." });
        }

        // Save submission with the verified ID string
        const newSubmission = new Submission({
            assignment: assignmentId,
            student: verifiedStudentId, 
            submissionData
        });

        await newSubmission.save();

        return res.status(201).json({
            success: true,
            message: "Assignment submitted successfully!",
            submission: newSubmission
        });
    } catch (e) {
        console.error("Submit Task Error: ", e.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// 2. GRADE A SUBMISSION (Teachers Only)
const gradeSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params; 
        const { grade, feedback } = req.body;

        if (grade === undefined || grade === null) {
            return res.status(400).json({ message: "Please provide a grade value." });
        }

        // Find and update the submission
        const submission = await Submission.findById(submissionId);
        if (!submission) {
            return res.status(404).json({ message: "Submission records not found." });
        }

        submission.grade = grade;
        submission.feedback = feedback || "";
        await submission.save();

        return res.status(200).json({
            success: true,
            message: "Submission graded successfully!",
            submission
        });
    } catch (e) {
        console.error("Grade Submission Error: ", e.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { submitTask, gradeSubmission };