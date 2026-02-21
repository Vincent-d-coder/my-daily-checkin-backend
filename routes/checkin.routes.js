const express = require("express");
const CheckIn = require("../models/CheckIn");
const Goal = require("../models/Goal");
const User = require("../models/User");
const isAuth = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", isAuth, async (req, res, next) => {
  try {
    const { status, goalStatus, goalId } = req.body;

    if (!goalId) {
      return res.status(400).json({ message: "Goal is required" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyChecked = await CheckIn.findOne({
      user: req.user.id,
      goal: goalId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 86400000), //add 24. hours to today
      },
    });

    if (alreadyChecked) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const checkIn = await CheckIn.create({
      user: req.user.id,
      goal: goalId,
      status,
      goalStatus,
      date: today,
    });
    await Goal.findByIdAndUpdate(goalId, { $push: { checkins: checkIn._id } });

    const user = await User.findById(req.user.id);

    if (status === "working") {
      user.currentStreak += 1;
      user.longestStreak = Math.max(user.currentStreak, user.longestStreak);
    } else {
      user.currentStreak = 0;
    }

    await user.save();

    res.status(201).json({
      checkIn,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
    });
  } catch (err) {
    next(err);
  }
});

//get single checkin

router.get("/:id", isAuth, async (req, res) => {
  try {
    const checkin = await CheckIn.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!checkin) {
      return res.status(404).json({ message: "Check-in not found" });
    }
    res.json(checkin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//read all checkins
router.get("/", isAuth, async (req, res, next) => {
  try {
    const checkIns = await CheckIn.find({ user: req.user.id })
      .populate({
        path: "goal",
        select: "title task location"}) 
      .sort({
        date: -1,
      });

    res.json(checkIns);
  } catch (err) {
    next(err);
  }
});

//update checkin
router.put("/:id", isAuth, async (req, res, next) => {
  try {
    const { status, goalStatus } = req.body;
    const updated = await CheckIn.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status, goalStatus },
      {
        new: true,
      },
    );

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

//delete checkin
router.delete("/:id", isAuth, async (req, res, next) => {
  try {
    const checkin = await CheckIn.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!checkin)
      return res.status(404).json({ message: "Checkin not found" });

    // remove from goal.checkins array
    await Goal.findByIdAndUpdate(checkin.goal, {
      $pull: { checkins: checkin._id },
    });

    res.json({ message: "Checkin deleted" });
  } catch (err) {
    next(err);
  }
});


module.exports = router;
