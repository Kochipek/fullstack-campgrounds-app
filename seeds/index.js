const mongoose = require("mongoose");
const db = mongoose.connection;
const Campground = require("../models/campgroundDB");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

// connect to the database and log a message to the console if the connection is successful
mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Seeds Database connected");
});
// This is a helper function that will return a random element from an array.
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 100; i++) {
    // we need to create a random number between 0 and 1000 because cities is an array of 1000 objects.
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 30) + 10;

    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image:`https://source.unsplash.com/random/600x400?camping,${i}`,
      description: "Campground is a secluded, peaceful retreat nestled in the heart of the forest. With its lush greenery and sparkling streams, it's the perfect place to escape the hustle and bustle of everyday life. The campground offers a variety of campsites, including both tent and RV options, as well as cabin rentals. Each site is equipped with a fire ring and picnic table, and there are also communal bathrooms and showers available for all guests. The campground also offers a variety of recreational activities, including hiking, fishing, and swimming in the nearby lake. Whether you're looking to relax and unwind or explore the great outdoors,Campground has something for everyone.",
      price: price,
    });
    await camp.save();
  }
};
seedDB().then(() => {
  mongoose.connection.close();
});
