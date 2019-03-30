const functions = require('firebase-functions');
var express = require("express");
var app = express();
var admin = require('firebase-admin');
var firebase = require("firebase");
var middleware = require("./middleware");
//sign in with google

// Initialize the default app
// Initialize Firebase
var config = {
	apiKey: "AIzaSyCm2OYhqzRi1NC7XAqr8z8nYRhuXHre9dU",
	authDomain: "untitled-39c4d.firebaseapp.com",
	databaseURL: "https://untitled-39c4d.firebaseio.com",
	projectId: "untitled-39c4d",
	storageBucket: "untitled-39c4d.appspot.com",
	messagingSenderId: "1074439140211"
};
firebase.initializeApp(config);

//set ejs shortcut
app.set("view engine", "ejs");
//store firebase user
var user = firebase.auth();
//database reference
var database = firebase.database();
//pass user to all ejs files
app.use(function(req,res,next){
	res.locals.currentUser = user;
	res.locals.verify = true;
	next();
});


//=============================
//RESTful routes
//=============================

//landing page
app.get("/", function(req, res){
	//make web app faster by using cache
	res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	//res.send(`${Date.now()}`);
	res.render("landing");
});
//login logic
app.post("/login", function(req,res){
	console.log("you have reached the post route");
	const promise = user.signInWithEmailAndPassword(req.body.username, req.body.password).then(function(success){
		res.redirect("/home");
	});
	promise.catch(e => {
		console.log("there is an error" + e.message);
		res.redirect("/login");
	});
});
//logout route
app.get("/logout", function(req,res){
	user.signOut();
	// req.logout();
	// req.flash("success", "logged you out");
	res.redirect("/");
});

//show login form
app.get("/login", function(req, res){
	res.render("login");
});
//show register form
app.get("/sign_up", function(req,res){
	res.render("sign_up");
});
//sign up logic
app.post("/sign_up", function(req,res){
	user.createUserWithEmailAndPassword(req.body.email, req.body.password).then(function(success){
		//store user data in database
		writeUserData(user.currentUser.uid, req.body.username, req.body.email);
		//send verification email
		user.currentUser.sendEmailVerification();
		res.redirect("/home");
	}).catch(function(error) {
		if(error){
		 	// Handle Errors here.
		  	var errorCode = error.code;
		  	console.log(error);
		  	var errorMessage = error.message;
		  	// ...
		}
	});
});



//home route
app.get("/home", function(req,res){
	//check if email has been verified
	if(user.currentUser!=null && !user.currentUser.emailVerified){
		console.log("not verified");
		//flash verification message after redirect
		return res.render("home", {verify: false});
	}else{
		res.render("home");
	}
	
});
//saves new user data
function writeUserData(userId, userName, email) {
	//refrence user path create child with userId set parameters
	database.ref('Users/').child(userId).set({
		username: userName,
		email: email,
		image: "default"
	});
	console.log("user data stored")
}

//realtime authentication state listener
// firebase.auth().onAuthStateChanged(firebaseUser => {
// 	if(firebaseUser) {
// 		console.log(firebaseUser);
// 	}else{
// 		console.log("not logged in");
// 	}
// });





exports.app = functions.https.onRequest(app);
