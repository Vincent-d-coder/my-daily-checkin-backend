const mongoose = require("mongoose");

const checkInSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // attendance status
    status: {
      type: String,
      enum: ["working", "sick", "off", "late", "half-day", "absent"],
      default: "working",
    },

    // goal progress status
    goalStatus: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("CheckIn", checkInSchema);
