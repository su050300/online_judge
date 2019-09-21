//getfollowering() function to load the users that a particular user is following at the time of body load

getfollowing();

function getfollowing(){
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.responseType = "json";
    xhttp.onreadystatechange = function() {
    
    // readystate denotes that the request is completed and the data is received and request is ok for status 200        
    if (this.readyState == 4 && this.status == 200) {
        document.getElementById("following-list").innerHTML = this.response.senddata;
        document.getElementById("pagination").innerHTML = this.response.page_info;
    }
  };

//sending the post ajax request to the same page    
xhttp.open("POST", window.location.href, true);
xhttp.send();
}

