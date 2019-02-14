var express = require('express');
var exphbs = require('express-handlebars');
var app = express();
var methodOverride = require("method-override");
var port = 5000;
var path = require('path');
var session = require('express-session');
var passport = require('passport'); //passport-local
var flash = require('connect-flash');
var router = express.Router();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var {ensureAuthenticated} = require('./helpers/auth');

//Configures routes
var users = require('./routes/users');

//Passportjs Config route
require('./config/passport')(passport);

//gets ride of warning for Mongoose
mongoose.Promise = global.Promise;

//connect to mongodb using mongoose
mongoose.connect("mongodb://localhost:27017/gameentries", {
    useMongoClient:true
}).then(function(){console.log("MongoDB Connected")}).catch(function(err){console.log(err)});

//Load in Entry Model
require('./models/Entry');
var Entry = mongoose.model('Entries');
require('./models/Users');
var Users = mongoose.model('Users');

//sets up dandlebars as our view engine
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//Functions needed to run body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Setup Express Session
app.use(session({
    secret:"Secret",
    resave:true,
    saveUninitialized:true
}));

//Setup Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//confiure flash messages
app.use(flash());

//Global variables
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

app.use(methodOverride('_method'));

//Route to entries
router.get('/entries', ensureAuthenticated, function(req, res){
    res.render('gameentries/addgame', {
        user:req.user
    });
});
//Route to Edit Game Entries
router.get('/gameentries/edit/:id', function(req, res){
    Entry.findOne({
        _id:req.params.id
    }).then(function(entry){
        res.render('gameentries/editgame', {
            users:req.user,
            entry:entry
        });
    });
    
    
});
//Route to put edited entry
router.put('/editgame/:id', function(req,res){
    Entry.findOne({
        _id:req.params.id
    }).then(function(entry){
        entry.title = req.body.title;
        entry.genre = req.body.genre;

        entry.save().then(function(idea){
        req.flash('success_msg', "Game Edited");
            res.redirect('/gamers');
        })
    });
});

router.get('/userlist/:id', function(req, res){
    Entry.find({
        user:req.params.id
    }).then(function(entries){
        res.render('userlist', {
            entries:entries
        })
    });
});

//Route to login
router.get('/login', function(req, res){
    res.render('login');
});

router.post('/login', function(req, res, next){
    passport.authenticate('local', {
        successRedirect:'/gamers',
        failureRedirect:'/users/register',
        failureFlash:true
    })(req, res, next);
});

router.get('/logout', function(req, res){
    req.logout();
    req.flash('success_msg', "You are logged out");
    res.redirect('/login');
});

//Gamers route
app.get('/gamers', ensureAuthenticated, function(req, res){
    //console.log("Request made from fetch");
    Entry.find({user:req.user.id}).then(function(entries){
        res.render("index", {
            entries:entries
        });
    });
});

//Index route
app.get('/', function(req, res){
    //console.log("Request made from fetch");
    Users.find({}).then(function(users){
        res.render("gamers", {
            users:users
        });
    });
});

// //Route to entries.html   ~~~Unneeded?~~~
// router.get('/entries', function(req, res){
//     res.sendFile(path.join(__dirname+'/entries.html'));
// });

//Post from form on index.html
app.post('/addgame', function(req, res){
    console.log(req.body);
    var newEntry = {
        title:req.body.title,
        genre:req.body.genre,
        user:req.user.id
    }
    new Entry(newEntry).save().then(function(entry){
        req.flash('success_msg', "Game Added");
        res.redirect('/gamers')
    });
});

//Delete Game Entry
app.delete('/:id', function(req,res){
    Entry.remove({_id:req.params.id})
    .then(function(){
        req.flash('success_msg', "Game Removed");
        res.redirect('/gamers');
    });
});

//routs for paths
app.use(express.static(__dirname+'/views'));
app.use(express.static(__dirname+'/scripts'))
app.use('/', router);
app.use('/users', users);
 
//starts server
app.listen(port, function(){
    console.log('Server is running on Port: ' + port);
});