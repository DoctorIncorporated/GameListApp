var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var bcrypt = require('bcryptjs');

//Load user modle
require('../models/Users');
var User = mongoose.model('Users');

//Route to register user
router.get('/register', function(req, res){
    res.render('users/register');
});

router.post('/register', function(req, res){
    var errors = [];

    if(req.body.password != req.body.password2){
        errors.push({text:"Passwords do not match"});        
    }
    if(req.body.password.length < 4){
        errors.push({text:"Password must be at least four(4) characters"});
    }
    if(errors.length > 0){
        res.render('users/register', {
            errors:errors,
            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
            password2:req.body.password2

        });
    }
    else{
        User.findOne({email:req.body.email}).then(function(user){
            if(user){
                //add flash message that user exists
                req.flash('error_msg', "Email Already Exists");
                res.redirect("/users/register");
            }
            else{
                var newUser = new User({
                    name:req.body.name,
                    email:req.body.email,
                    password:req.body.password
                });

                bcrypt.genSalt(1, function(err, salt){
                    bcrypt.hash(newUser.password, salt, function(err, hash){
                        if(err)throw err;
                        newUser.password = hash;
                        new User(newUser).save().then(function(user){
                            //flash message that user registered
                            req.flash('success_msg', "You Are Now A Registered User")
                            res.redirect('/login');
                        }).catch(function(err){
                            console.log(err);
                            return;
                        });
                    });
                });
            }
        });
    }
    
    /*var newUser = {
        name:req.body.name,
        email:req.body.email,
        password:req.body.password
    }
    new User(newUser).save().then(function(user){
        res.redirect('/')
    });*/
});

module.exports = router;