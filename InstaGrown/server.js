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
const crypto = require('crypto');

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
    Salt: String,
    Hash: String,
    Bio: String,
    Email: String,
    Friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    //Posts: [{ type: Schema.Types.ObjectID, ref: 'Post' }]
    Friends: [],
    Posts: []
});
var Users = mongoose.model('Users', UserSchema);

//Post Schema
var PostSchema = new Schema({
    //Poster: UserSchema, // maybe uncomment later?
    Title: String,
    Content: String,
    Image: String, //TODO how to implement images
    Comments: [],
    Likes: [],
    //Comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    //Likes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});
var Posts = mongoose.model('Posts', PostSchema);

//Comment Schema
var CommentSchema = new Schema({
    //Poster: UserSchema,
    Content: String,
    Likes: []
    //Likes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});
var Comment = mongoose.model('Comment', CommentSchema);

//Message Schema
var MessageSchema = new Schema({
    Sender: UserSchema,
    Receiver: UserSchema,
    Content: String,
    Time: Number
});
var Message = mongoose.model('Message', MessageSchema);

/*    REQUESTS   */

//index.html requests---------------------------------------------------------------------

//takes a UserObject JSON string from client, parses, uses fields username and passowrd to login
app.post("/login/user/", (req, res) => {
    var userObj = JSON.parse(req.body.userObjStr);
    var user = userObj.username;
    var pass = userObj.password;

    //Check if user already exists if not or pass wrong return error
    Users.find({ Username: user }).exec(function(error, results) {
        if (results.length == 0) {
            res.end(JSON.stringify({ text: 'error' }));
        } else {

          //get salt and hash from db
          var salt = results[0].Salt;
          var iterations = 100;
          //hash the salt and password using crypto
          crypto.pbkdf2(pass, salt, iterations, 64, 'sha512', (err, hash) => {
            if(err) throw err;
            var hStr = hash.toString('base64');

            //check if password matches
            if (results[0].Hash != hStr) {
              res.end(JSON.stringify({ text: 'error' }));
            } else {
                //add cookie for login 10 min timer
                res.cookie("login", { username: user }, { maxAge: 900000 });
                console.log("login successful!")
                res.end(JSON.stringify({ text: 'ok' }));
            }
          });
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
    Users.find({ Username: user }).exec(function(error, results) {
        //if no other accounts with that name exist
        if (results.length == 0) {
          //generate random string for salt, iterations
          var salt = crypto.randomBytes(64).toString('base64');
          var iterations = 100;
          //hash the salt and password using crypto
          crypto.pbkdf2(pass, salt, iterations, 64, 'sha512', (err, hash) => {
            if(err) throw err;
            var hStr = hash.toString('base64');

            //create and save the user
            var newUser = new Users({
              Username: user,
              Salt: salt,
              Hash: hStr,
              Bio: bio,
              Email: email,
              Friends: [],
              Posts: []
            });
            newUser.save(function(err) { if (err) console.log("error occured saving to db"); });
            console.log('user created!');
            res.end(JSON.stringify({ text: 'User created!' }));
          });
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
app.get("/search/user/:KEY", (req, res) => {
    //get data from params
    user = req.params.KEY;

    //search database and return list of users
    Users.find({ Username: new RegExp(user, "i") }).exec(function(error, results) {
        var result = [];
        for (var i = 0; i < results.length; i++) {
            //add user to list of found users
            result.push(results[i]);
        }
        res.end(JSON.stringify(result, null, 2));
    });
});

//searches posts with keyword in content field, takes a JSON string of searchObj{ keyword: key }
app.get("/search/posts/:KEY", (req, res) => {
    key = req.params.KEY;

    console.log("searching post with key " + key);

    //search database and return list of posts whose content contains key
    Posts.find({ Content: new RegExp(key, "i") }).exec(function(error, results) {
        var result = [];
        for (var i = 0; i < results.length; i++) {
            //add post to list of found posts
            result.push(results[i]);
        }
        res.end(JSON.stringify(result, null, 2));
    });
});


// for testing, not called in functions
app.get("/home.html/get/posts", (req, res) => {
    Posts.find({}).exec(function(error, results) {
        res.end(JSON.stringify(results, null, 4));
    });
});
// for testing, not called in functions
app.get("/home.html/get/users", (req, res) => {
    Users.find({}).exec(function(error, results) {
        res.end(JSON.stringify(results, null, 4));
    });
});

//adds a comment to a post
app.get("/comment/post/:TITLE/:CONTENT/:COMMENT", (req, res) => {
  let t = req.params.TITLE;
  let c = req.params.CONTENT;
  let commentParam = req.params.COMMENT;
  userN = req.cookies.login.username;

  // save
  Posts.find({Title:t, Content: c}).exec(function(error, results) {
    if (results.length != 0) {
      var newComment = new Comment({Content: commentParam, Likes:[]});
      newComment.save(function (err) { if (err) console.log("ERROR");});
      db.collection("posts").update(
        { Title:t, Content: c },
        { $push: { Comments: newComment } });
      updateComments(t, c, userN, newComment);
      res.send("GOOD");
    } else {
      res.send("Doesnt exist"); // shouldn't trigger
    }
  });
});

// used to update the array of posts in user when a post is liked
function updateComments(t, c, u){
  userN = u;
  updated = [];
  Users.find({Username:userN}).exec(function(error, results) {
    var user = results[0];
    Posts.find({Title:t, Content: c}).exec(function(error, results) {
      newPost = results[0];
      for (i in user.Posts) {
        if (user.Posts[i].Title == t && user.Posts[i].Content == c) {
          updated.push(newPost);
        } else {
          updated.push(user.Posts[i]);
        }
      }
      db.collection("users").update(
        {Username: userN},
        {$set: {Posts: updated }}
      );
    });
  });
}

//returns a user's profile
app.get("/get/user/profile", (req, res) => {

});

//returns a list of user's friends
app.get('/get/user/friends', (req, res) => {
    //get user from cookies
    var user = req.cookies.login.username;

    //Search for user to get their friends data
    Users.find({ Username: user }).populate("Friends").exec(function(error, results) {
    //Users.find({Username:user}).exec(function(error, results) {
        if (results.length == 0) {
            console.log("username from cookies " + user + " not found in database");
            res.end(JSON.stringify({ text: 'error' }));
        } else {
            userData = results[0];
            var result = [];
            //save friend data to a list
            for(var i = 0; i < userData.Friends.length; i++) {
                result.push(userData.Friends[i]);
            }
            //return the list of friends
            res.end(JSON.stringify(result, null, 2));
        }
    });
});

//adds a user as a friend
app.post("/add/user/friend", (req, res) => {
    //parse JSON object store data
    var friendObj = JSON.parse(req.body.friendObjStr);
    var id = friendObj.friendName;
    console.log("id of user trying to add " + id);

    //get user from cookies
    var user = req.cookies.login.username;

    //Search for user to get their data
    Users.find({ Username: user }).exec(function(error, results) {
        if (results.length == 0) {
            console.log("username from cookies " + user + " not found in database");
            res.end(JSON.stringify({ text: 'error' }));
        } else {
            userData = results[0];

            //Search for the friend, user is trying to add
            Users.find({ _id: id }).exec(function(error, results) {
                if (results.length == 0) {
                    console.log("friend id " + id + " not found");
                    res.end(JSON.stringify({ text: 'error' }));
                } else {
                    //add id to friends list and re-save into database
                    userData.Friends.push(results[0]._id);
                    userData.save(function(err) {
                        if (err) console.log("error occured saving to db");
                    });
                    res.end(JSON.stringify({ text: 'success' }));
                }
            });
        }
    });
});

//adds a like to a post
app.get("/like/post/:TITLE/:CONTENT", (req, res) => {
  let t = req.params.TITLE;
  let c = req.params.CONTENT;
  userN = req.cookies.login.username;
  Posts.find({Title:t, Content: c}).exec(function(error, results) {
    if (results.length != 0) {
      if (results[0].Likes.includes(userN)) {
        console.log(results[0]);
        res.send("You Cannot Like a Post More than Once!");
      } else {
        //adds username to post like array
        db.collection("posts").update(
          {Title:t, Content: c},
          {$push: {Likes: userN }}
        );
        updatePosts(t, c, userN);
        res.send("GOOD");
      }
    } else {
      res.send("Doesnt exist");
    }
  });
});

// used to update the array of posts in user when a post is liked
function updatePosts(t, c, u){
  userN = u;
  updated = [];
  Users.find({Username:userN}).exec(function(error, results) {
    var user = results[0];
    Posts.find({Title:t, Content: c}).exec(function(error, results) {
      newPost = results[0];
      for (i in user.Posts) {
        if (user.Posts[i].Title == t && user.Posts[i].Content == c) {
          updated.push(newPost);
        } else {
          updated.push(user.Posts[i]);
        }
      }
      db.collection("users").update(
        {Username: userN},
        {$set: {Posts: updated }}
      );
    });
  });
}


//adds a like to a comment
app.post("/like/comment", (req, res) => {

});

//shares another user's post as a new post from the current user
app.get("/share/post/:T/:C", (req, res) => {
  userN = req.cookies.login.username;
  title ="Sharing " + "'"+req.params.T+"'";
  content = req.params.C;
  Users.find({ Username: userN }).exec(function(error, results) {
      if (results.length == 1) {
          // creates and saves post
          var newPost = new Posts({
            Title: title,
            Content: content,
            Comments: [],
            Likes: [],
          });
          newPost.save(function (err) { if (err) console.log("ERROR");});

          // updates user's array of posts
          db.collection("users").update( //collection name?
              { Username: userN }, { $push: { Posts: newPost } }
          );
          res.end("GOOD");
          // if no username matches, send no such username
      } else {
          res.end("No such username");
      }
  });
});

//gets the posts from the server
app.get("/get/posts", (req, res) => {
  Posts.find({}).exec(function(error, results) {
    results.reverse();
    res.end(JSON.stringify(results, null, 4));
  });
  /*
    userN = req.cookies.login.username;
    // searches for username
    Users.find({ Username: userN }).exec(function(error, results) {
        if (results.length == 1) {
            postsList = results[0].Posts;
            res.end(JSON.stringify(postsList, null, 4));
            // if no username matches, send no such username
        } else {
            res.end("BAD");
        }
    });*/
});

app.post("/create/post", (req, res) => {
    userN = req.cookies.login.username;
    console.log("test1");
    Users.find({ Username: userN }).exec(function(error, results) {
        if (results.length == 1) {
          console.log("test2");
            // creates and saves post
            let postString = JSON.parse(req.body.Post);
            var newPost = new Posts(postString);
            newPost.save(function(err) { if (err) console.log("ERROR"); });

            // updates user's array of posts
            db.collection("users").update( //collection name?
                { Username: userN }, { $push: { Posts: newPost } }
            );
            res.end("GOOD");
            // if no username matches, send no such username
        } else {
            console.log("test3");
            res.end("No such username");
        }
    });
});


//updates the users bio
app.post("/update/bio", (req, res) => {
    //get user from cookies
    var user = req.cookies.login.username;

    //parse JSON object store data
    var bioObj = JSON.parse(req.body.bioObjStr);
    var bio = bioObj.bio;

    //Search for user to update their bio
    Users.find({ username: user }).exec(function(error, results) {
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

//function for hashing the password when creating user
function hashPass(password){

}

/*    RUNTIME    */

//pages to serve depending on path
//app.use('/accountCreation.html');
app.use('/chats.html', authorize);
app.use('/home.html', authorize);
app.use('/', express.static("public_html"));


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
