/*
  Author: Lloyd Dakin, Nicholas Eng
  Class: CSC337
  Description: index js that sends AJAX requests to server for adding new users
*/

/* FUNCTIONS */

//sends ajax request to server to add a new account, if account already exists denys
function login() {
    var user = $('#username').val().toString();
    var pass = $('#password').val().toString();

    //create a JSON obj
    var userObj = { username: user, password: pass };
    var userObj_str = JSON.stringify(userObj);

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
                window.location = '/home.html';
            }
        }
    });
}
