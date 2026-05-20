const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
    assignment: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Assignment", 
        required: true 
    },
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    submissionData: { type: String, required: true }, 
    grade: { type: Number, default: null },          
    feedback: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Submission", SubmissionSchema);