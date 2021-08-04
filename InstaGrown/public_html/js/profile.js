
//load the users information when page starts
window.onLoad = populateProfile();

//move back to the home page
function homePage(){
  window.location = "../home.html";
}

//change the user's bio
function updateBio(){

  var newBio = prompt("Please enter your new bio, refresh after to see!");
  if (newBio != null) {

    //create a JSON obj
    var bioObj = { bio: newBio };
    var bioObj_str = JSON.stringify(bioObj);

    $('#bio').text(newBio);

    $.ajax({
        url: '/update/bio',
        data: { bioObjStr: bioObj_str },
        method: 'POST',
        success: function(res) {
          //not sure why this isn't running
            populateBio();
        }
    });
  }
}

//various functions to fill out the divs on the page
function populateProfile(){
  populateUsername();
  populateBio();
  populateFriendsList();
}

//gets username displays on html
function populateUsername(){
  $.ajax({
    url: '/get/username/',
    method: 'GET',
    success: function(res) {
      var result = JSON.parse(res);
      var userName = result.text;
      $('#username').text(userName);
    }
  });
}

//gets user's bio and displays on html
function populateBio(){
  $.ajax({
    url: '/get/user/bio',
    method: 'GET',
    success: function(res) {
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
function generateFriend(friendData) {
  var str = '';
  str += '<div class="friendTile">';
  str += '<h3 class="friendTileName">' + friendData.Username + '</h3>';
  str += '<p class="friendTileBio">' + friendData.Bio + '</p>';
  str += '</div>';
  return str;
}