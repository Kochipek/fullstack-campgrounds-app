const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const db = mongoose.connection;
const campgroundDB = require("./models/campgroundDB");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utilities/catchAsync");
const expressError = require("./utilities/expressError");
const app = express();
const {campgroundSchema} = require("./schemas.js");
const review = require("./models/review");
// parse the body of the request and add it to the req.body object
app.use(express.urlencoded({ extended: true }));

// enable the use of put and delete methods in forms
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", { useNewUrlParser: true, useUnifiedTopology: true });
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("home");
});

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
      const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg, 400)
  } else {
      next();
  }
}

app.get("/campgrounds", catchAsync(async (req, res, next) => {
  const allCampgrounds = await campgroundDB.find({});
  res.render("campgrounds/index", { allCampgrounds });
}));

app.get("/campgrounds/newCampground", (req, res) => {
  
  res.render("campgrounds/newCampground");
});

// CRUD OPERATIONS FOR CAMPGROUNDS

// create campground route
app.post("/campgrounds", validateCampground, catchAsync(async (req, res, next) => {
  const campground = new campgroundDB(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}));

// show campground route
app.get("/campgrounds/:id", catchAsync( async (req, res, next) => {
  const isValidId = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!isValidId) return next(new expressError("Invalid Campground Id", 400));
  const campground = await campgroundDB.findById(req.params.id);
  if (!campground) return next(new expressError("Campground Not Found", 404));
  res.render("campgrounds/show", { campground });
}));

// edit campground route
app.get("/campgrounds/:id/edit", catchAsync(async (req, res, next) => {
  const campground = await campgroundDB.findById(req.params.id);
  if (!campground) return next(new expressError("Campground not found", 404));
  res.render("campgrounds/edit", { campground });
}));

// update campground route
app.put("/campgrounds/:id", validateCampground, catchAsync(async (req, res) => {
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

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404))
})

// basic error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!'
  res.status(statusCode).render('error', { err })
})

// adding reviews to campgrounds.
app.post('/campgrounds/:id/reviews',catchAsync(async (req, res) => {
  res.send('sdafsd')
}))


app.listen(3030, () => {
  console.log("serving on port 3030");
});
