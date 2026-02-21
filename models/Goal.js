const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    title: { type: String, required: true },
    task: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    checkins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CheckIn",
      },
    ],
    date: {
        type: Date,
        required: true,
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model("Goal", goalSchema);
