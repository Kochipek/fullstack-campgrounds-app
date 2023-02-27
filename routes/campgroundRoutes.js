const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const { campgroundSchema } = require("../schemas.js");
const expressError = require("../utilities/expressError");
const campgroundDB = require("../models/campgroundDB");

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new expressError(msg, 400);
  } else {
    next();
  }
};

router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await campgroundDB.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

router.get("/newCampground", (req, res) => {
  res.render("campgrounds/newCampground");
});

router.post(
  "/",
  validateCampground,
  catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new campgroundDB(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const campground = await campgroundDB
      .findById(req.params.id)
      .populate("reviews");
    if (!campground) {
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
  })
);

router.get(
  "/:id/edit",
  catchAsync(async (req, res) => {
    const campground = await campgroundDB.findById(req.params.id);
    if (!campground) {
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  })
);

router.put(
  "/:id",
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await campgroundDB.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await campgroundDB.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

module.exports = router;
