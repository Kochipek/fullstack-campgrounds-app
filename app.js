const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const db = mongoose.connection;
const campgroundDB = require("./models/campgroundDB");
const methodOverride = require("method-override");

const app = express();
// this parses the body of the request and adds it to the req.body object
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
// connect to the database and log a message to the console if the connection is successful
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

app.get("/campgrounds", async (req, res) => {
  // Campground.find({}) will return all the campgrounds in the database
  const allCampgrounds = await campgroundDB.find({});
  res.render("campgrounds/index", { allCampgrounds });
});

// order matters here, if we put this route above the /campgrounds route, it will always render the newCampground page 
// because it will always match the /campgrounds route
app.get('/campgrounds/newCampground', (req, res) => {
    res.render('campgrounds/newCampground');
});

// CRUD OPERATIONS FOR CAMPGROUNDS

// create campground route
app.post("/campgrounds", async (req, res) => {
    const campground = new campgroundDB(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
});
// show campground route
app.get("/campgrounds/:id", async (req, res) => {
  const campground = await campgroundDB.findById(req.params.id);
  res.render("campgrounds/show", { campground });
});

// edit campground route
app.get("/campgrounds/:id/edit", async (req, res) => {
    const campground = await campgroundDB.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
});

app.listen(3030, () => {
  console.log("serving on port 3030");
});
