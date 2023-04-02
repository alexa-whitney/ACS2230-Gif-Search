const handlebars = require('express-handlebars');
// Require Libraries
const express = require('express');
const axios = require('axios');
require('dotenv').config()

// App Setup
const app = express();

// Telling the Express app that my static files will live in the public folder
app.use(express.static('public'));

// Require tenorjs near the top of the file
const Tenor = require("tenorjs").client({
    // Replace with your own key
    "Key": process.env.API_KEY, // https://tenor.com/developer/keyregistration
    "Filter": "high", // "off", "low", "medium", "high", not case sensitive
    "Locale": "en_US", // Your locale here, case-sensitivity depends on input
});

// Middleware
//allow Express (our web framework) to render HTML templates and send them back to the client using a new function

const hbs = handlebars.create({
    // Specify helpers which are only registered on this instance.
    helpers: {
        foo() { return 'FOO!'; },
        bar() { return 'BAR!'; }
    }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');

// Routes
// example URL "http://localhost:3000/?term=hey"
app.get('/', (req, res) => {
    // Handle the home page when we haven't queried yet
    term = ""
    if (req.query.term) {
        term = req.query.term
        // Tenor.search.Query("SEARCH KEYWORD HERE", "LIMIT HERE")
        Tenor.Search.Query(term, "10")
            .then(response => {
                // store the gifs we get back from the search
                const gifs = response;
                // pass the gifs as an object into the home page
                res.render('home', { gifs })
            }).catch(console.error);
    }
    else {
        res.render('home', { gifs: [] })
    }
});

// CHALLENGE - Add Trending Button
app.get('/trending', async (req, res) => {
    try {
      const response = await axios.get(`https://api.tenor.com/v1/trending?key=${process.env.API_KEY}&limit=20`);
      const gifs = response.data.results.map(result => ({
        id: result.id,
        title: result.title,
        url: result.media[0].gif.url,
        itemurl: result.itemurl,
      }));
      res.render('home', { gifs });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error getting trending GIFs');
    }
  });

app.get('/greetings/:name', (req, res) => {
    // grab the name from the path provided
    const name = req.params.name;
    // render the greetings view, passing along the name
    res.render('greetings', { name });
})

// Start Server

//tells the app to log a message on port 3000. Once we start the server, we should see that message in the terminal 
app.listen(3000, () => {
    console.log('Gif Search listening on port localhost:3000!');
});