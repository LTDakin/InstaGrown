function createPost() {
  // gets post body
  var postText = document.getElementById("postText").value;
  var postTitle = document.getElementById("titleText").value;

  // creates post according to schema in server.js
  //post = {Poster: "", Content: d, Image: "", Comments: [], Likes: []};
  post = {Title : postTitle , Content: postText, Image: "", Comments: [], Likes: []};
  post_str = JSON.stringify(post);
  params = "Post="+post_str;
  console.log("????");
  $.ajax({
    // designates url, type of request, and data
    url: "/create/post",
    method: "POST",
    data: params,
    success: function(result) {
      if (result == "GOOD") {
        let url = "../home.html";
        window.location = url;
      } else { alert(result); }
    }
  });
}
