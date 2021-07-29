/*
  Author: Lloyd Dakin, Nicholas Eng
  Class: CSC337
  Description: server for the InstaGrown app, uses mongoose to store information like users, post friends statuses etc.
*/

/*    SETUP   */
//imports
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

//Connect to mongoDB ostaa database
const db = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/InstaGrown';
mongoose.connect(mongoDBURL, { useNewUrlParser: true });
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

/*  SCHEMAS  */
var Schema = mongoose.Schema;

//User schema
var UserSchema = new Schema({
    Username: String,
    Passowrd: String,
    Bio: String,
    Email: String,
    Friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    Posts: [{ type: Schema.Types.ObjectID, ref: 'Post' }]
});

//Post Schema
var PostSchema = new Schema({
    Poster: UserSchema,
    Content: String,
    Image: String, //TODO how to implement images
    Comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    Likes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

//Comment Schema
var CommentSchema = new Schema({
    Poster: UserSchema,
    Content: String,
    Likes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

//Message Schema
var MessageSchema = new Schema({
    Sender: UserSchema,
    Receiver: UserSchema,
    Content: String,
    Time: Number
});

//add schemas to database
var User = mongoose.model('User', UserSchema);
var Comment = mongoose.model('Comment', CommentSchema);
var Post = mongoose.model('Post', PostSchema);
var Message = mongoose.model('Message', MessageSchema);

/*    REQUESTS   */

//index.html requests---------------------------------------------------------------------

//takes a UserObject JSON string from client, parses, uses fields username and passowrd to login
app.post("/login/user/", (req, res) => {
    var userObj = JSON.parse(req.body.userObjStr);
    var user = userObj.username;
    var pass = userObj.password;
    //Check if user already exists if not or pass wrong return error
    User.find({ username: user }).exec(function(error, results) {
        if (results.length == 0) {
            res.end(JSON.stringify({ text: 'error' }));
        } else {
            //check if password matches
            if (results[0].password != pass) {
                res.end(JSON.stringify({ text: 'error' }));
            } else {
                //add cookie for login 10 min timer
                res.cookie("login", { username: user }, { maxAge: 900000 });
                console.log("login successful!")
                res.end(JSON.stringify({ text: 'ok' }));
            }
        }
    });
});

//accountCreation.html requests-----------------------------------------------------------

//adding a new user, takes UserObjectJSONstr and gets username and password
app.post("/add/user/", (req, res) => {
    //parse JSON object store data
    var userObj = JSON.parse(req.body.userObjStr);
    var user = userObj.username;
    var pass = userObj.password;
    var bio = userObj.bio;
    var email = userObj.email;

    //Check if user already exists
    User.find({ username: user }).exec(function(error, results) {
        //create the account
        if (results.length == 0) {
            var newUser = new User({
                username: user,
                password: pass,
                Bio: bio,
                Email: email,
                Friends: [],
                Posts: []
            });
            newUser.save(function(err) { if (err) console.log("error occured saving to db"); });
            console.log('user created!');
            res.end(JSON.stringify({ text: 'User created!' }));
        }
        //user exists, send error
        else {
            console.log('user already exists!');
            res.end(JSON.stringify({ text: 'error' }));
        }
    });
});

//home.html requests----------------------------------------------------------------------

//searches users with keyword, takes a JSON string of searchObj{ username: name }
app.get("/search/user/", (req, res) => {

    //parse JSON object store data
    searchObj = JSON.parse(req.body.searchObjStr);
    user = searchObj.username;

    //search database and return list of users
    User.find({ username: user }).exec(function(error, results) {
        var result = [];
        for (var i = 0; i < results.length; i++) {
            //add user to list of found users
            result.push(results[i]);
        }
        res.end(JSON.stringify(result, null, 2));
    });
});

//searches posts with keyword in content field, takes a JSON string of searchObj{ keyword: key }
app.get("/search/posts/", (req, res) => {

    //parse JSON object store data
    searchObj = JSON.parse(req.body.searchObjStr);
    key = searchObj.keyword;

    //search database and return list of posts whose content contains key
    Post.find({ Content: new RegExp(req.params.key, "i") }).exec(function(error, results) {
        var result = [];
        for (var i = 0; i < results.length; i++) {
            //add post to list of found posts
            result.push(results[i]);
        }
        res.end(JSON.stringify(result, null, 2));
    });
});

//adds a comment to a post
app.post("/comment/post/", (req, res) => {

});

//returns a user's profile
app.get("/get/user/profile", (req, res) => {

});

//returns a list of user's friends
app.get('/get/user/friends', (req, res) => {
    //get user from cookies
    var user = req.cookies.login.username;

    //Search for user to get their friends data
    User.find({ username: user }).populate("Friends").exec(function(error, results) {
        if (results.length == 0) {
            console.log("username from cookies " + user + " not found in database");
            res.end(JSON.stringify({ text: 'error' }));
        } else {
            userData = results[0];
            var result = '';
            for (var i = 0; userData.Friends.length; i++) {
                result += userData.Friends[i];
            }
            //return the list of friends
            res.end(JSON.stringify(result, null, 2));
        }
    });
});

//adds a user as a friend
app.get("/add/user/friend", (req, res) => {
    //parse JSON object store data
    var friendObj = JSON.parse(req.body.friendObjStr);
    var name = friendObj.friendName;

    //get user from cookies
    var user = req.cookies.login.username;

    //Search for user to get their data
    User.find({ username: user }).exec(function(error, results) {
        if (results.length == 0) {
            console.log("username from cookies " + user + " not found in database");
            res.end(JSON.stringify({ text: 'error' }));
        } else {
            userData = results[0];

            //Search for the friend user is trying to add
            User.find({ username: name }).exec(function(error, results) {
                if (results.length == 0) {
                    console.log("friend name " + name + " not found");
                    res.end(JSON.stringify({ text: 'error' }));
                } else {
                    //add to friends list and re-save into database
                    userData.Friends.push(results[0]._id);
                    userData.save(function(err) {
                        if (err) console.log("error occured saving to db");
                    });
                }
            });
        }
    });
});

//adds a like to a post
app.post("/like/post", (req, res) => {

});

//adds a like to a comment
app.post("/like/comment", (req, res) => {

});

//shares another user's post as a new post from the current user
app.post("/share/post", (req, res) => {

});

//creates a new post from the user
app.post("/create/post", (req, res) => {

});

//updates the users bio
app.post("/update/bio", (req, res) => {
    //get user from cookies
    var user = req.cookies.login.username;

    //parse JSON object store data
    var bioObj = JSON.parse(req.body.bioObjStr);
    var bio = bioObj.bio;

    //Search for user to update their bio
    User.find({ username: user }).exec(function(error, results) {
        if (results.length == 0) {
            console.log("username from cookies " + user + " not found in database");
            res.end(JSON.stringify({ text: 'error' }));
        } else {
            //update the bio and save back into DB
            userData = results[0];
            userData.Bio = bio;
            userData.save(function(err) {
                if (err) console.log("error occured saving to db");
            });
        }
    });
});

//chats.html requests---------------------------------------------------------------------

//sends a specified user a message
app.post("/send/user/message", (reg, res) => {

});

//~~~~~~~~~~~~~~~~~~Misc requests 

//return the current user based on client's cookie
app.get('/get/username/', (req, res) => {
    res.end(JSON.stringify({ text: req.cookies.login.username }));
});

/*    FUNCTIONS   */
function authorize(req, res, next) {
    //update to a more secure salting and hashing method with session keys
    if (req.cookies.login.username != undefined)
        next();
    else
        res.end('unauthorized');
}

/*    RUNTIME    */

//pages to serve depending on path
app.use('/accountCreation.html', authorize);
app.use('/chats.html', authorize);
app.use('/home.html', authorize);
app.use('/', express.static("public_html"));