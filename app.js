const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Fruit = require('./models/fruit');

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


app.get('/', (req, res) => {
    res.render('home')
});
app.get('/fruits', async (req, res) => {
    const fruits = await Fruit.find({});
    res.render('fruits/index', { fruits })
});
app.get('/fruits/new', (req, res) => {
    res.render('fruits/new');
})

app.post('/fruits', async (req, res) => {
    const Fruit = new Fruit(req.body.Fruit);
    await Fruit.save();
    res.redirect(`/fruits/${Fruit._id}`)
})

app.get('/fruits/:id', async (req, res,) => {
    const fruit = await Fruit.findById(req.params.id)
    res.render('fruits/show', { fruit });
});

app.get('/fruits/:id/edit', async (req, res) => {
    const fruit = await Fruit.findById(req.params.id)
    res.render('Fruits/edit', { fruit });
})

app.put('/fruits/:id', async (req, res) => {
    const { id } = req.params;
    const fruit = await Fruit.findByIdAndUpdate(id, { ...req.body.fruit });
    res.redirect(`/fruits/${fruit._id}`)
});

app.delete('/fruits/:id', async (req, res) => {
    const { id } = req.params;
    await Fruit.findByIdAndDelete(id);
    res.redirect('/fruits');
})



app.listen(3000, () => {
    console.log('Serving on port 3000')
})