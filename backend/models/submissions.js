const mongoose = require("mongoose");
require("./assignments");
require("./users"); 

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

// Check to see if model is already compiled to prevent model re-compilation over-writes
module.exports = mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);