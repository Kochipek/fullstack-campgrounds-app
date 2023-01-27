const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const db = mongoose.connection;
const campgroundDB = require("./models/campgroundDB");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utilities/catchAsync");
const app = express();
// this parses the body of the request and adds it to the req.body object
app.use(express.urlencoded({ extended: true }));
//underscore method override allows us to use the put and delete methods in our forms
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campgrounds", catchAsync(async (req, res) => {
  // Campground.find({}) will return all the campgrounds in the database
  const allCampgrounds = await campgroundDB.find({});
  res.render("campgrounds/index", { allCampgrounds });
}));

// order matters here, if we put this route above the /campgrounds route, it will always render the newCampground page
// because it will always match the /campgrounds route
app.get("/campgrounds/newCampground", (req, res) => {
  res.render("campgrounds/newCampground");
});

// CRUD OPERATIONS FOR CAMPGROUNDS

// create campground route
app.post("/campgrounds", catchAsync(async (req, res, next) => {
    const campground = new campgroundDB(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  }));
// show campground route
app.get("/campgrounds/:id", catchAsync( async (req, res) => {
  const campground = await campgroundDB.findById(req.params.id);
  res.render("campgrounds/show", { campground });
}));

// edit campground route
app.get("/campgrounds/:id/edit",catchAsync(async (req, res) => {
  const campground = await campgroundDB.findById(req.params.id);
  res.render("campgrounds/edit", { campground });
}));

//update campground route
app.put("/campgrounds/:id", catchAsync(async (req, res) => {
  const { id } = req.params;
  //use the spread operator to spread out the properties of the req.body.campground object
  const campground = await campgroundDB.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  res.redirect(`/campgrounds/${campground._id}`);
}));
// delete campground route
app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
  const { id } = req.params;
  await campgroundDB.findByIdAndDelete(id);
  res.redirect("/campgrounds");
}));

app.all("*", (err, req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// basic error handling
app.use("*", (err, req, res, next) => {
  res.sendFile(__dirname + "/views/error.html");
});


app.listen(3030, () => {
  console.log("serving on port 3030");
});
