const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbars = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongo = require('mongodb');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/login');
const db = mongoose.connection;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbars({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
// Switch to json
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

app.use(flash());

app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

const routes = require('./routes/index');
app.use('/', routes);

const users = require('./routes/users');
app.use('/users', users);

app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
    console.log("Server started on localhost : " + app.get('port'));
});