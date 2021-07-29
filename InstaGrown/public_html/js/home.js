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
    var friendObj = { friendName = name };
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
    var bioObj = { bio = b };
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
populateFriendsList();