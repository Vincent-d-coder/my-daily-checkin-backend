const express = require("express");
const Goal = require("../models/Goal");
const CheckIn = require("../models/CheckIn");
const isAuth = require("../middleware/auth.middleware");
const router = express.Router();

const housekeepingTasks = [
  "Clean and sanitize guest bathrooms",
  "Replace bed linens and pillow covers",
  "Vacuum corridors and elevators",
  "Restock minibar items",
  "Replenish towels on all floors",
  "Dust lobby furniture and decorations",
  "Clean hotel windows and glass doors",
  "Inspect rooms for maintenance issues",
  "Disinfect high-touch surfaces",
  "Prepare VIP rooms for arrivals",
  "Deep clean staircases",
  "Laundry and linen sorting",
  "Restock housekeeping carts",
  "Clean staff break rooms",
  "Organize storage rooms",
];

function getRandomTask() {
  return housekeepingTasks[
    Math.floor(Math.random() * housekeepingTasks.length)
  ];
}

// CREATE GOAL FOR TODAY
router.post("/today", isAuth, async (req, res) => {
  try {
    const { title, location } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // prevent duplicate goal for same day
    const existingGoal = await Goal.findOne({
      user: req.user.id,
      date: today,
    });

    if (existingGoal) {
      return res.status(400).json({ message: "Goal already exists for today" });
    }

    const goal = await Goal.create({
      user: req.user.id,
      title: title || "Today's Housekeeping Shift",
      task: getRandomTask(),
      location: location || "Hotel",
      date: today,
    });

    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// CREATE GOAL FOR TOMORROW (auto planner)
router.post("/", isAuth, async (req, res) => {
  try {
    const { title, location } = req.body;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const goal = await Goal.create({
      user: req.user.id,
      title: title,

      location: location || "Hotel",
      date: tomorrow,
    });

    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET TODAY GOAL
router.get("/today", isAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const goal = await Goal.findOne({
      user: req.user.id,
      date: today,
    }).populate("checkins");

    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/upcoming", isAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const goals = await Goal.find({
      user: req.user.id,
      date: { $gte: today },
    })
      .sort({ date: 1 })
      .populate("checkins");

    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", isAuth, async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user.id })

      .populate("checkins")
      .sort({
        createdAt: -1,
      });

    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", isAuth, async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//goals for the next days

router.put("/:id", isAuth, async (req, res, next) => {
  try {
    const { title, task, location } = req.body;

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, task, location },
      { returnDocument: "after" },
    );

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", isAuth, async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // remove check-ins when a goal is deleted
    try {
      await CheckIn.deleteMany({ goal: goal._id });
    } catch (cleanupErr) {
      console.error("Failed to delete related check-ins:", cleanupErr);
    }

    res.json({ message: "Goal deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
