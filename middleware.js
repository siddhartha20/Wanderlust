const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");  //Joi
const { reviewSchema } = require("./schema.js");  //Joi


module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){  //Passport method
        req.session.redirectUrl = req.originalUrl; // storing post-url to session so that we can redirect to it after login 
        req.flash("error", "you must be logged in to create listing");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectedUrl = (req, res, next) => { // as passport resets session on every authentication
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "Sorry! Permission Denied.")
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",")
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",")
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "Sorry! Permission Denied.")
        return res.redirect(`/listings/${id}`);
    }
    next();
};