if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const ExpressError = require('./utils/ExpressError');
const User = require('./models/user');
const universityRoutes = require('./routes/uniRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');

const dbUrl = 'mongodb://localhost:27017/real-university' || process.env.DB_URL;
mongoose.connect(dbUrl);

// connect to mongoose
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', () => {
    console.log('Database connected')
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
// join path
app.set('views', path.join(__dirname, 'views'));
// to pre-populate and parse the request body
app.use(express.urlencoded({ extended: true }));
// to use method override to send put/patch requests
app.use(methodOverride('_method'));
// serve static assets
app.use(express.static(path.join(__dirname, 'public')));
// santize query string
app.use(mongoSanitize());

// store session in mongo
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});
store.on("error", function(e) {
    console.log('Session Store Error', e)
});

// session and flash setup
const sessionConfig = {
    store,
    name: 'ru-session',
    secret: '+mdcpq(z)%79wwd7h*a701=emn&br6gm(nea_gaw+^&7mst--%',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dgeqifdzu/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


// passport setup
app.use(passport.initialize());
app.use(passport.session()); // has to be placed after app.use(session())
passport.use(new LocalStrategy(User.authenticate())); // authenticate() generates a static method used in LocalStrategy

passport.serializeUser(User.serializeUser()); // how to store a user in a session
passport.deserializeUser(User.deserializeUser());

// middleware
app.use((req, res, next) => {
    // the current user that's logged-in
    res.locals.currUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// use routers
app.use('/', userRoutes);
app.use('/universities', universityRoutes);
app.use('/universities/:id/reviews', reviewRoutes);

// home route
app.get('/', (req, res) => {
    res.render('home');
});

// for all types of requests in all routes, if nothing above runs
app.all('*', (req, res, next) => {
    // the next() method will call the error handler middleware defined below
    next(new ExpressError('Page not Found', 404))
})

// custom error handler middleware, renders the custom error page
app.use((err, req, res, next) => {
    // receive the error message and status code
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong'
    // set status to the code and render the custom error page
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('Serving on port 3000')
});