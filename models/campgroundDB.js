const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    image: String,
    description: String,
    location: String,
    reviews: [
        {
            // schema.types.objectId is a special type of mongoose that allows us to reference a specific object.
            // ref: 'Review' is the name of the model that we are referencing.
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }]
});

module.exports = mongoose.model('Campgrounds', CampgroundSchema);
