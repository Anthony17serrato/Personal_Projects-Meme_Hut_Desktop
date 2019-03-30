var middlewareObj = {};
var sourceFile = require("../index.js");
middlewareObj.isLoggedIn = function(req,res,next){
	sourceFile.currentUser.onAuthStateChanged(function(user) {
	  if (user) {
	    // User is signed in.
	    next();
	  } else {
	    // No user is signed in.
	    res.redirect("/");	
	  }
	});
	
}
module.exports = middlewareObj;