const mongoose = require("mongoose");
const db = mongoose.connection;
const campgroundDB = require("../models/campgroundDB");
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
  await campgroundDB.deleteMany({});
  for (let i = 0; i < 100; i++) {
    // we need to create a random number between 0 and 1000 because cities is an array of 1000 objects.
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 30) + 10;

    const camp = new campgroundDB({
      author: "64059c480584ab5365c11ad8",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price
    });
    await camp.save();
  }
};
seedDB().then(() => {
  mongoose.connection.close();
});
