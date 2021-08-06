/*
  Author: Lloyd Dakin, Nicholas Eng
  Class: CSC337
  Description: index js that sends AJAX requests to server for adding new users
*/

/* FUNCTIONS */

// sends ajax request to server to login with the given user.
// redirects to home.html if successful, displays error if invalid login
function login() {
    var user = $('#username').val().toString();
    var pass = $('#password').val().toString();

    //create a JSON obj
    var userObj = { username: user, password: pass };
    var userObj_str = JSON.stringify(userObj);

    // creates request
    $.ajax({
        url: '/login/user/',
        data: { userObjStr: userObj_str },
        method: 'POST',
        success: function(res) {
            var result = JSON.parse(res);
            //if error returned show 'incorrect login' text
            if (result.text == 'error') {
                $('#errorLogin').css('visibility', 'visible');
            } else {
                //login correct, go to home page, save session cookie
                console.log("correct login");
                $('#errorLogin').css('visibility', 'hidden');
                // redirects
                window.location = '/home.html';
            }
        }
    });
}

// changes window to the accountCreation.html page
function createAccountPage() {
    window.location = "../accountCreation.html";
}
