/*
  Author: Lloyd Dakin, Nicholas Eng
  Class: CSC337
  Description: accountCreation js that sends AJAX requests to server for adding new users
*/

/*    FUNCTIONS    */

//takes form information and sends ajax request to server to add a new account.
//if account already exists, user will see an alert on the screen
function createUser() {
  // gets information
  var user = $('#userNameInput').val();
  var pass = $('#passwordInput').val();
  var em = $('#emailInput').val();
  var b = $('#bio').val();

  //create a JSON obj
  var userObj = { username: user, password: pass, email: em, bio: b };
  var userObj_str = JSON.stringify(userObj);

  // sends request
  $.ajax({
    url: '/add/user/',
    data: { userObjStr: userObj_str },
    method: 'POST',
    success: function(res) {
      //after sucess send back to login
      var result = JSON.parse(res);
      if (result.text == 'error') {
        alert('Username already taken!');
      } else {
        // if success, redirects to login page
        window.location = '/index.html';
      }
    }
  });
}
