createPost() {
  // gets post body
  var postText = document.getElementById("post").value;

  // creates post according to schema in server.js
  //post = {Poster: "", Content: d, Image: "", Comments: [], Likes: []};
  post = {Content: d, Image: "", Comments: [], Likes: []};
  post_str = JSON.stringify(post);
  params = "Post="+post_str;

  $.ajax({
    // designates url, type of request, and data
    url: "/create/post",
    method: "POST",
    data: params,
    success: function(result) {
      if (result == "GOOD") {
        let url = "/home.html";
        window.location = url;
      } else {
        alert(result);
      }
    }
  });
}
