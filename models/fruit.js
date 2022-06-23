const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const FruitSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
});

// mongoose middleware for deleting review after deleting a fruit
FruitSchema.post('findOneAndDelete', async function(doc) {
    if(doc) {
        await Review.deleteMany({
            _id: {
                // all ids in fruit.reviews
                $in: doc.reviews
            }
        })
    }
})
module.exports = mongoose.model('Fruit', FruitSchema);