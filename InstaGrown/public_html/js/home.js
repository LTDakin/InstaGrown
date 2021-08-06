/*
  Author: Lloyd Dakin, Nicholas Eng
  Class: CSC337
  Description: contains requests for features of the home screen such as
  displaying/adding friends, searching posts, searching users etc
*/

// when the page is loaded, populates the posts and friends list
window.onLoad = populatePosts();
window.onLoad = populateFriendsList();

// Gets list of user's friends from db and displays in the friendsContent
// Adds each friend to the display
function populateFriendsList() {
    //get username and then get user's friend list
    // sends a request to get the username
    $.ajax({
        url: '/get/username/',
        method: 'GET',
        success: function(res) {
            // if successful request, sends anothr request to get the user's friends
            var result = JSON.parse(res);
            var userName = result.text;
            $.ajax({
                url: '/get/user/friends',
                method: 'GET',
                success: function(res) {
                    //array of the user's friends
                    var result = JSON.parse(res);
                    var friendsHtml = '';
                    // adds each friend to the display
                    for (var i = 0; i < result.length; i++) {
                        friendsHtml += generateFriend(result[i]);
                    }
                    //add friendsHtml to section
                    $('#friendsContent').html(friendsHtml);
                }
            });
        }
    });
}

//loads the posts into the post section div
function populatePosts() {
    $.ajax({
        // sends a request to get the posts from the db
        url: "/get/posts",
        method: "GET",
        success: function(result) {
            // updates text with result from request
            results = JSON.parse(result);
            let displayedResult = '';
            // iterates through each post and adds it to the result
            for (i in results) {
              displayedResult += generatePosts(results[i], i);
            }
            // sets the inner html to the posts html generated in generatePosts()
            postsContent.innerHTML = displayedResult;
        }
    });
}

//-------------------------------------------------------------------------------Button Functions

//navigates page to the create a post page
function postPage() {
    window.location = "../createPost.html";
}

//navigates page to the profile page
function profilePage() {
    window.location = "../profile.html";
}

// adds a friend to user's friends
// alerts if error or if successful
function addFriend(id) {
    //get button's id, id is the friend to be added
    var userId = id;

    //create a JSON obj
    var friendObj = { friendName: userId };
    var friendObj_str = JSON.stringify(friendObj);

    $.ajax({
        // sends a request to add a User to a user's friend list
        url: '/add/user/friend',
        data: { friendObjStr: friendObj_str },
        method: 'POST',
        success: function(res) {
            var result = JSON.parse(res);

            //if error returned report
            if (result.text == 'error') {
                alert('error');
            } else {
                // if successful, alerts and updates the display
                alert('friend added!');
                populateFriendsList();
            }
        }
    });
}

//updates the users bio/status in the database
function updateBio() {
    // gets the input from the newBio prompt
    var b = $('#newBio').val().toString();

    //creates a JSON obj using the info
    var bioObj = { bio: b };
    var bioObj_str = JSON.stringify(bioObj);

    // sends a request to update the bio in the User
    $.ajax({
        url: '/update/bio',
        data: { bioObjStr: bioObj_str },
        method: 'POST',
        success: function(res) {
            var result = JSON.parse(res);

            //if error returned report
            if (result.text == 'error') {
                alert('error');
            } else {
                // alert if bio successfully updated
                alert('bio updated!');
            }
        }
    });
}

//adds a like to a post
function like(divName){
    // gets the post that the user clicked
    var parent1 = divName.parentNode; //span
    var parent2 = parent1.parentNode; //actionBar div
    var parent = parent2.parentNode; // actual post div
    var divArray = parent.children;

    // gets the title of the post
    ti = divArray[0].id;
    t = document.getElementById(ti).innerText;

    // gets the content of the post
    co = divArray[1].id;
    c = document.getElementById(co).innerText;

    // sends a request to update the "Liked" array in the User
    $.ajax({
        url: "/like/post/" + t +"/" + c,
        method: "GET",
        success: function(result) {
          // alerts error if not successful,
          // populates the posts otherwise
          if (result != "GOOD") {
            alert(result);
          } else {
            alert("Post liked!");
            populatePosts();
          }
        }
    });
  }

// shares a post (reposts it)
// the shared post has the same content as the original
// and the original's title formatted like: "Sharing <POSTNAME>"
function share(divName) {
    var parent1 = divName.parentNode; //span
    var parent2 = parent1.parentNode; //actionBar div
    var parent = parent2.parentNode; // actual post div
    var divArray = parent.children;

    // gets original posts title
    ti = divArray[0].id;
    t = document.getElementById(ti).innerText;

    // gets original posts content
    co = divArray[1].id;
    c = document.getElementById(co).innerText;

    // sends request to share post
    $.ajax({
        url: "/share/post/" + t + "/" + c,
        method: "GET",
        success: function(result) {
            // alerts if successful or not, populatePosts if successful
            if (result != "GOOD") {
                alert("ERROR!");
            } else {
                alert("Post Shared!");
                populatePosts();
            }
        }
    });
}

//adds a comment to a post
function comment(divName) {
    var parent1 = divName.parentNode; //span
    var parent2 = parent1.parentNode; //actionBar div
    var parent = parent2.parentNode; // actual post div
    var divArray = parent.children;

    // gets the title of the post
    ti = divArray[0].id;
    t = document.getElementById(ti).innerText;

    // gets the content of the post
    co = divArray[1].id;
    c = document.getElementById(co).innerText;

    // gets the content of the comment
    var commentArray = parent1.children;
    ct = commentArray[0].id;
    newCommentText = document.getElementById(ct).value;

    // sends request to post the comment to the original post
    $.ajax({
        url: "/comment/post/" + t + "/" + c + "/" + newCommentText,
        method: "GET",
        success: function(result) {
            // alerts if successful or not, populatePosts if successful
            if (result != "GOOD") {
                alert("ERROR!");
            } else {
                alert("Comment posted!");
                populatePosts();
            }
        }
    });
}

//searches for either users or posts and displays
function search() {
    // gets values for requests
    var option = $('#searchOption').val();
    var key = $('#searchKey').val();

    //handle depending on the search option
    if (option == "users") {
        //search users with keyword
        $.ajax({
            url: '/search/user/'+key,
            method: 'GET',
            success: function(res) {
                var resultUsers = JSON.parse(res);
                var friends = [];

                //get list of user's friends
                $.ajax({
                    url: '/get/user/friends',
                    method: 'GET',
                    success: function(res) {
                        //array of the user's friends
                        var result = JSON.parse(res);
                        for(i in result){
                            friends.push(result[i].Username);
                        }
                        //display the users returned in middle section
                        var displayedResult = '';
                        for(i in resultUsers){
                            //default to false
                            var friendBool = false;
                            //if user is a friend let generate method know to not add a addFriend() button
                            if(friends.includes(resultUsers[i].Username)){
                                var friendBool = true;
                            }
                            displayedResult += generateUsers(resultUsers[i], friendBool);
                        }
                        //add the html to middle of page
                        $('#postsContent').html(displayedResult);
                    }
                });
            }
        });
    // if option == posts, sends a request to search for posts
    } else if (option == "posts") {
        $.ajax({
            url: '/search/posts/'+key,
            method: 'GET',
            success: function(res) {
                var result = JSON.parse(res);
                //display the posts returned in middle section
                var displayedResult = '';
                for(i in result){
                    displayedResult += generatePosts(result[i], i);
                }
                //add the html to middle of page
                $('#postsContent').html(displayedResult);
            }
        });
    } else {
        alert("error");
    }
}

//-------------------------------------------------------------------------------Helper Functions

//Generates the html for a friend for friends list
function generateFriend(friendData) {
    var str = '';
    str += '<div class="friendTile">';
    str += '<h3 class="friendTileName">' + friendData.Username + '</h3>';
    str += '<p class="friendTileBio">' + friendData.Bio + '</p>';
    str += '</div>';
    return str;
}

//generates html code to display users
function generateUsers(userObj, friendBool){
    var str = '';
    str += '<div class="userTile" id='+ userObj._id +'>';
    str += '<h3 class="userTileName">'+ userObj.Username +'</h3>';
    //if they are not friends add a button to addFriend()
    if(friendBool != true){
        str += '<button class="addFriendButton" id="'+userObj._id+'" onclick="addFriend(this.id)">Add Friend</button>'
    }
    str += '<p class="userTileEmail"> Contact: '+ userObj.Email +'</p>';
    str += '<p class="userTileBio">'+ userObj.Bio +'</p>';
    str += '</div>'
    return str;
}

// generates html code to display posts
// adds post title, content, likes, a comment section, and a button to like,
// comment, or share the post
function generatePosts(postObj, i){
    var str = '';
    // the 'i' is used to differentiate each div to help locate specific posts
    str += '<div class="postDiv" id="postDiv' + i + '">';
        str += '<h2 id="getTitle' + i + '">' + postObj.Title + '</h2>';
        str += '<div id="getContent' + i + '">' + postObj.Content + '</div>';
            str += '<br><br>';
            str += '<div id= "actionBar' + i + '">';
            // comment, like, and share buttons
            str += '<span id="Comment' + i + '">';
                str += '<input type = "text" name = comment id = "getCommentText' + i + '"/>';
                str += '<input type="button"value="Comment"onclick="comment(this);" id = "commentButton' + i + '">';
            str += '</span>';
            str += '<br><span id="Like' + i + '">';
                str += '<input type="button" value="Like" onclick="like(this);">';
                str += ' ' +  postObj.Likes.length + ' Likes';
            str += '</span>';
            str += '<br><span id="Share' + i + '">';
                str += '<input type="button" value="Share" onclick="share(this);">';
            str += '</span>';
        str += '</div>';
        str += '<br>';
        str += '<div>Comments:</div>';
        str += '<br>';
        // adds the comments
        for (j in postObj.Comments) {
            str += '<div id=commentDiv>' + postObj.Comments[j].Content+ '</div>';
        }
    str += '</div>';
    // returns completed html
    return str;
}
