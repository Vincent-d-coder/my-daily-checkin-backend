const mongoose = require("mongoose");

const checkInSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        completed: {
             type: Boolean, 
             required: true },
        date: { type: Date, required: true }
        },
        { timestamps: true }
    
);

module.exports = mongoose.model("CheckIn", checkInSchema);