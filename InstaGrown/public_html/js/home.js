searchUsers() {
  // create object and ajax request
}

searchPosts() {

}

function timeUpdate() {
  setInterval(fetchMessages, 1000);
}

function comment() {
  var parent = divName.parentNode;
  var divArray = parent.children;

  ti = divArray[0].id;
  //de = divArray[3].id;
  t = document.getElementById(ti).innerText;

  commentText = document.getElementById("commentText").innerText;

  post = {Content: commetText, Likes: []};
  post_str = JSON.stringify(post);
  params = "Post="+post_str;
  $.ajax({
    //url: "/comment/post/"+t+"/"+d,
    url: "/comment/post/"+t,
    method: "POST",
    data: params,
    success: function(result) {}
  });
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
        displayedResult += '<div class="postDiv"'+i+'>'
        + results[i].title+'<br>'
        + results[i].Content+'<br>'
        '<div id= "actionBar">'+
        '<span id="like"><input type="button" value="Like"onclick="like();"></span>'+
        '<span id="comment"><input type="button"'
        +'<input type = "text" name = comment id = "commentText"/>'
        +'value="Comment"onclick="comment();">'+
        '</span></div>'+ results[i].Comments+'</div>';

        //        	<label for="userName">Username: </label>
        //        	<input type = "text" name = userName id = "userNameInput"/>
      }
      posts = document.getElementById("posts");
      posts.innerHTML = displayedResult;
    });
  });
}

// calls timeUpdate(), which updates the posts every 1 second.
timeUpdate();
