var express     = require("express");
//mergeParams will merge the params from the campground, and the comments together,
//so that here inside comment routes, we are able to access the /:id that we defined
var router      = express.Router({mergeParams:true});
var Campground  = require("../models/campground");
var Comment     = require("../models/comment");
var middleware  = require("../middleware");

// Comments New
router.get("/new", middleware.isLoggedIn, function(req, res) {
    // find campground by id
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {campground:foundCampground});
        }
    });
});

//Comments Create
router.post("/", middleware.isLoggedIn, function(req, res) {
    //lookup campground using id
    Campground.findById(req.params.id, function(err, foundCampground) {
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
           Comment.create(req.body.comment, function(err, comment){
               if(err){
                   req.flash("error", "Something went wrong");
                   console.log(err);
               } else {
                   //add username and id to comment
                   comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                   //save comment
                   comment.save();
                   foundCampground.comments.push(comment);
                   foundCampground.save();
                   console.log(comment);
                   req.flash("success", "Successfully added comment");
                    //req.params.id and foundCampground._id is the same thing, can use either.    
                   res.redirect("/campgrounds/" + foundCampground._id);
               }
           });
       }
    });
});

// EDIT COMMENTS ROUTE
router.get("/:comment_id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err){
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    })
});

// UPDATE COMMENTS ROUTE
router.put("/:comment_id", middleware.checkCampgroundOwnership, function(req, res){
    console.log(req.body.comment);
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/"+ req.params.id);
        }
    }) 
});

//COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCampgroundOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
            res.redirect("back");
       } else {
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
       }
    });
});

module.exports = router;