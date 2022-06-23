const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Fruit = require('./models/fruit');
const catchAysnc = require('./utils/catchAsync');
const ExpressError =require('./utils/ExpressError');
const { fruitSchema, reviewSchema } = require('./validateSchemas.js');
const Review  = require('./models/review');
const fruit = require('./models/fruit');

mongoose.connect('mongodb://localhost:27017/fruitdiscovery');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateFruit = (req, res, next) =>{
    // schema to handle errors on server side
  
    const { error } = fruitSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
app.get('/', (req, res) => {
    res.render('home')
})

// display all fruits
app.get('/fruits', catchAysnc(async (req, res) => {
    const fruits = await Fruit.find({});
    res.render('fruits/index', { fruits })
}))

// new fruit page
app.get('/fruits/new', (req, res) => {
    res.render('fruits/new');
})

// add new fruit
app.post('/fruits', validateFruit, catchAysnc(async (req, res, next) => {
    // if(!req.body.fruit) throw new ExpressError('Invalid fruit data', 400);
    
    const Fruit = new Fruit(req.body.Fruit);
    await Fruit.save();
    res.redirect(`/fruits/${Fruit._id}`)
}))

// find fruit
app.get('/fruits/:id', catchAysnc(async (req, res,) => {
    const fruit = await Fruit.findById(req.params.id).populate('reviews');
    res.render('fruits/show', { fruit });
}))

// edit fruit
app.get('/fruits/:id/edit', catchAysnc(async (req, res) => {
    const fruit = await Fruit.findById(req.params.id)
    res.render('Fruits/edit', { fruit });
}))


// update fruit
app.put('/fruits/:id', validateFruit, catchAysnc(async (req, res) => {
    const { id } = req.params;
    const fruit = await Fruit.findByIdAndUpdate(id, { ...req.body.fruit });
    res.redirect(`/fruits/${fruit._id}`)
}))

// delete fruit
app.delete('/fruits/:id', catchAysnc(async (req, res) => {
    const { id } = req.params;
    await Fruit.findByIdAndDelete(id);
    res.redirect('/fruits');
}))

//submit a review
app.post('/fruits/:id/reviews', validateReview, catchAysnc(async(req, res) =>{
    const fruit = await Fruit.findById(req.params.id);
    const review = new Review(req.body.review);
    fruit.reviews.push(review);
    await review.save();
    await fruit.save();
    res.redirect(`/fruits/${fruit._id}`);
}))

//delete a review
app.delete('/fruits/:id/reviews/:reviewId', catchAysnc( async(req, res) => {
    const { id, reviewId } = req.params;
    await Fruit.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/fruits/${id}`);
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('not found', 404));
})

app.use((err, req, res, next) => {
    const {status = 500 } = err;
    if(!err.message) err.message = 'something wrong';
    res.status(status).render('error', { err });
})

app.listen(3000, () => {
    console.log('Serving on port 3000');
})