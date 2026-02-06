const express = require("express");
const CheckIn = require("../models/CheckIn");
const User = require("../models/User");           
const isAuth = require("../middleware/auth.middleware");

const router = express.Router();




router.post("/", isAuth,async (req, res, next) => {
    try{
        const { completed } = req.body;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const alreadyChecked = await CheckIn.findOne({
            user: req.user.id,
            date: { $gte: today }
        });

        if (alreadyChecked) {
            return res.status(400). json({ message: "Already checked in today" });
        }

        const checkIn = await CheckIn.create({
            user: req.user.id,
            completed,
            date: new Date()
        });
        
        const user = await User.findById(req.user.id);

        if (completed) {
            user.currentStreak += 1;
            user.longestStreak = Math.max(
                user.currentStreak,
                user.longestStreak
            );
        } else {
            user.currentStreak = 0;
        }

        await user.save();

        res.status(201).json({
            checkIn,
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak
        });
    } catch (err) {
        next(err);
    }
});
//read all checkins
router.get("/", isAuth, async (req, res, next) => {
  try {
    const checkIns = await CheckIn.find({ user: req.user.id })
      .sort({ date: -1 });

    res.json(checkIns);
  } catch (err) {
    next(err);
  }
});

//update checkin
router.put("/:id", isAuth, async (req, res, next) => {
    try{
        const updated = await CheckIn.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updated);
    }catch (err) {
        next(err);
    }
});

//delete checkin
router.delete("/:id", isAuth,async (req, res, next) => {
    try{
        await CheckIn.findByIdAndDelete(req.params.id);
        res.json({ message: "Check-in deleted" });
    } catch (err) {
        next(err);
    }
});


module.exports = router;
