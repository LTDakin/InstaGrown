function postPage() {
    window.location = "../createPost.html";
}

//Generates the html for a friend for friends list
function createFriend(friendData) {
    var str = '';
    str += '<div class="friendItem">';
    str += '<h3>' + friendData.Username + '</h3>';
    str += '<p class="friendBio">' + friendData.Bio + '</p>';
    str += '</div>';
    return str;
}

//Gets list of user's friends from db and displays in the FriendsContent
function populateFriendsList() {
    //generate friends list and insert into friendsContent
    var friendListArea = $('#friendsContent');
    //get username and then get user's friend list
    $.ajax({
        url: '/get/username/',
        method: 'GET',
        success: function(res) {
            var result = JSON.parse(res);
            var userName = result.text;
            $.ajax({
                url: '/get/user/friends',
                method: 'GET',
                success: function(res) {
                    //array of the user's friends
                    var result = JSON.parse(res);
                    var friendsHtml = '';
                    for (var i = 0; i < result.length; i++) {
                        friendsHtml += createFriend(result[i]);
                    }
                    //add friendsHtml to section
                    friendListArea.html(friendsHtml);
                }
            });
        }
    });
}

//adds a friend to user's friends TODO  no button exists yet
function addFriend() {
    //button's id is the friend to be added
    //TODO not sure where this button is made yet
    var name = 'Joe'; //TODO pick name off button

    //create a JSON obj
    var friendObj = { friendName: name };
    var friendObj_str = JSON.stringify(friendObj);

    $.ajax({
        url: '/add/user/friend',
        data: { friendObjStr: friendObj_str },
        method: 'POST',
        success: function(res) {
            var result = JSON.parse(res);

            //if error returned report
            if (result.text == 'error') {
                alert('error');
            } else {
                alert('friend added!');
            }
        }
    });
}

function updateBio() {
    //TODO no button exists yet to do this
    var b = $('#newBio').val().toString();

    //create a JSON obj
    var bioObj = { bio: b };
    var bioObj_str = JSON.stringify(bioObj);

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
                alert('bio updated!');
            }
        }
    });
}

/* RUNTIME */
function searchUsers() {
    name = document.getElementById("searchName").innerText;
    var searchObj = {
        username: name
    };
    $.ajax({
        url: "/search/user",
        method: "GET",
        data: searchObj,
        success: function(result) {}
    });
}

function searchPosts() {
    post = document.getElementById("searchPost").innerText;
    var searchObj = {
        keyword: key
    };
    $.ajax({
        url: "/search/posts",
        method: "GET",
        data: searchObj,
        success: function(result) {}
    });
}

function timeUpdate() {
    setInterval(populatePosts, 1000);
    setInterval(populateFriendsList, 1000);
}

function comment() {
    var parent = divName.parentNode;
    var divArray = parent.children;

    ti = divArray[0].id;
    //de = divArray[3].id;
    t = document.getElementById(ti).innerText;

    commentText = document.getElementById("commentText").innerText;

    post = { Content: commetText, Likes: [] };
    post_str = JSON.stringify(post);
    params = "Post=" + post_str;
    $.ajax({
        //url: "/comment/post/"+t+"/"+d,
        url: "/comment/post/" + t,
        method: "POST",
        data: params,
        success: function(result) {}
    });
}

function populatePosts() {
    $.ajax({
        url: "/get/posts",
        method: "GET",
        success: function(result) {
            // updates text with result from request
            results = JSON.parse(result);
            let displayedResult = '';
            console.log(results);
            // iterates through each post and adds it to the result
            for (i in results) {

                displayedResult += '<div class="postDiv"' + i + '>' +
                    results[i].Title + '<br>' +
                    results[i].Content + '<br>' +
                '<div id= "actionBar">' +
                '<span id="like"><input type="button" value="Like"onclick="like();"></span>' +
                '<span id="comment"><input type="button"' +
                '<input type = "text" name = comment id = "commentText"' +
                'value="Comment"onclick="comment();"/>' +
                '</span></div>' + results[i].Comments + '</div>';

                //        	<label for="userName">Username: </label>
                //        	<input type = "text" name = userName id = "userNameInput"/>
            }
            posts = document.getElementById("postsContent");
            posts.innerHTML = displayedResult;
        }
    });
}

//searches for either users or posts and displays
function search() {
    console.log("search() being called");

    var option = $('#searchOption').val();
    var key = $('#searchKey').val();

    console.log("Searching with option " + option + " and key " + keyword)

    if (option == "users") {
        //create a JSON obj
        var searchObj = { username: key };
        var searchObj_str = JSON.stringify(searchObj);

        $.ajax({
            url: '/search/user/',
            method: 'GET',
            data: { searchObjStr: searchObj_str },
            success: function(res) {
                var result = JSON.parse(res);
                //display the users returned in middle section
                console.log(result);
            }
        });
    } else if (option == "posts") {
        //create a JSON obj
        var searchObj = { keyword: key };
        var searchObj_str = JSON.stringify(searchObj);

        $.ajax({
            url: '/search/posts/',
            method: 'GET',
            data: { searchObjStr: searchObj_str },
            success: function(res) {
                var result = JSON.parse(res);
                //display the posts returned in middle section
                console.log(result);
            }
        });
    } else {
        alert("error");
    }
}

// calls timeUpdate(), which updates the posts every 1 second.
timeUpdate();
//populateFriendsList();
