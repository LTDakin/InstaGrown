/*
  Author: Lloyd Dakin, Nicholas Eng
  Class: CSC337
  Description: js functions that help display the user's profile
*/


//load the users information when page starts
window.onLoad = populateProfile();

//move back to the home page
function homePage(){
  window.location = "../home.html";
}

//change the user's bio
function updateBio(){
  // prompts user to change bio
  var newBio = prompt("Please enter your new bio, refresh after to see!");

  // updates user's bio if the prompt string is not empty
  if (newBio != null) {
    //create a JSON obj
    var bioObj = { bio: newBio };
    var bioObj_str = JSON.stringify(bioObj);
    // updates displayed div
    $('#bio').text(newBio);

    // sends request to update the bio in the User
    $.ajax({
      url: '/update/bio',
      data: { bioObjStr: bioObj_str },
      method: 'POST',
      success: function(res) {
        populateBio();
      }
    });
  }
}

//functions to fill out the divs on the page
function populateProfile(){
  populateUsername();
  populateBio();
  populateFriendsList();
}

//gets the user's username to display on the profile page
function populateUsername(){
  $.ajax({
    url: '/get/username/',
    method: 'GET',
    success: function(res) {
      // if success, updates text
      var result = JSON.parse(res);
      var userName = result.text;
      $('#username').text(userName);
    }
  });
}

//gets the user's bio to display on the profile page
function populateBio(){
  $.ajax({
    url: '/get/user/bio',
    method: 'GET',
    success: function(res) {
      // if success, updates text
      var result = JSON.parse(res);
      var bio = result.bio;
      $('#bio').text(bio);
    }
  });
}

//Gets list of user's friends from db and displays in the FriendsContent
function populateFriendsList() {
  //get username and then get user's friend list
  $.ajax({
    url: '/get/username/',
    method: 'GET',
    success: function(res) {
      // gets friend list of users if success
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
            friendsHtml += generateFriend(result[i]);
          }
          //add friendsHtml to section
          $('#friendsTileArea').html(friendsHtml);
        }
      });
    }
  });
}

//Generates the html for a friend for friends list
// this html is formatted in profile.css
function generateFriend(friendData) {
  var str = '';
  str += '<div class="friendTile">';
  str += '<h3 class="friendTileName">' + friendData.Username + '</h3>';
  str += '<p class="friendTileBio">' + friendData.Bio + '</p>';
  str += '</div>';
  return str;
}
