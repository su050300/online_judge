
// getcontests() function on body load for getting contests to verify;
window.addEventListener("load", getcontests);

  
    function getcontests(){
      var xhttp;
      xhttp = new XMLHttpRequest();
      xhttp.responseType = "json";
      xhttp.onreadystatechange = function() {
      // readystate denotes that the request is completed and the data is received and request is ok for status 200
        if (this.readyState == 4 && this.status == 200) {
          if (this.response.senddata === '0'){
            document.getElementById("thead").style.display = 'none';
            document.getElementById("arrows").style.display = 'none';
            document.getElementById("no_data").innerHTML = 'No more contest to verify';
            
          }
          else{
        
            document.getElementById("contest-list").innerHTML = this.response.senddata;
            document.getElementById("pagination").innerHTML = this.response.page_info;
             
          }
        }
      };
//sending the post ajax request to the same page  
  xhttp.open("POST", window.location.href, true);
  xhttp.send();}


