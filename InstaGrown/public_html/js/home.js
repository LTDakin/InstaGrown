getUsers() {

}

getPosts() {

}

function timeUpdate() {
  setInterval(fetchMessages, 1000);
}

function fetchMessages(){
  $.ajax({
    url: "/get/posts",
    method: "GET",
    success: function(result) {
      // updates text with result from request
      postArea = document.getElementById("posts");
      results=JSON.parse(result);
      let displayedResult = '';
      // iterates through each post and adds it to the result
      for (i in results) {
        displayedResult += '<div class="postDiv">' + results[i].Content+
        '<div id= "actionBar">'+
        '<span id="like"><input type="button" value="Like"onclick="like();"></span>'+
        '<span id="comment"><input type="button" value="Comment"onclick="comment();">'+
        '</span></div></div>';
      }
      posts = document.getElementById("posts");
      posts.innerHTML = displayedResult;
    });
  });
}

// calls timeUpdate(), which updates the posts every 1 second.
timeUpdate();
