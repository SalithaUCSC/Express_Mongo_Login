const express = require('express');

const router = express.Router();

router.get('/', ensureAuthenticated, function(req, res){
    res.render('index', {
        userSess: req.session.username
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.redirect('/users/login');
    }
}
module.exports = router;