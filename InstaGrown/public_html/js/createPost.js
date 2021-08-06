/*
  Author: Lloyd Dakin, Nicholas Eng
  Class: CSC337
  Description: js that sends AJAX requests to server for adding new posts
*/

// takes info from post creation form and sends request to create new post to server
// if successful, redirects to home page, otherwise alerts the user.
function createPost() {
  // gets post body
  var postText = document.getElementById("postText").value;
  var postTitle = document.getElementById("titleText").value;

  // creates post according to schema in server.js
  post = {Title : postTitle , Content: postText, Image: "", Comments: [], Likes: []};
  post_str = JSON.stringify(post);
  params = "Post="+post_str;

  // sends request
  $.ajax({
    // designates url, type of request, and data
    url: "/create/post",
    method: "POST",
    data: params,
    success: function(result) {
      if (result == "GOOD") {
        // redirects if success, alerts otherwise
        let url = "../home.html";
        window.location = url;
      } else { alert(result); }
    }
  });
}
