//load_practice() function for loading the problems available for practice purpose on body load

load_practice();

// for using filters on clicking the apply button
document.getElementById("apply").addEventListener("click", load_practice);



// load practice
function load_practice(){

    var xhttp;
    var query = {status: '',difficulty: '',subdomain: ''};
    xhttp = new XMLHttpRequest();
    var status = document.getElementsByClassName('status');
    var difficulty = document.getElementsByClassName('difficulty');
    var  subdomain = document.getElementsByClassName('subdomain');
    
    //appending different parameters choosen
    if (status.length != 0 || difficulty.length != 0 || subdomain.length != 0){
      for (var i = 0;i < status.length;i++){
        if (status[i].checked){
         query.status += status[i].value + ' ';  
        } 
      }
    
      //appending different parameters choosen
      for (var i = 0;i < difficulty.length;i++){
          if (difficulty[i].checked){
          query.difficulty += difficulty[i].value + ' ';  
        } 
      }

      //appending different parameters choosen
      for (var i = 0;i < subdomain.length;i++){
          if (subdomain[i].checked){
          query.subdomain += subdomain[i].value + ' ';  
        } 
      }
      
    }
    xhttp.onreadystatechange = function() {
        // readystate denotes that the request is completed and the data is received and request is ok for status 200
      if (this.readyState == 4 && this.status == 200) {
        
        if (this.responseText === ''){
         
          document.getElementById("thead").style.visibility = 'hidden';
          document.getElementById("problem-list").innerHTML = '';
          document.getElementById("no_data").innerHTML = 'No problems match your search';
          
        }
        else{
          document.getElementById("thead").style.visibility = 'visible';          
          document.getElementById("problem-list").innerHTML = this.responseText;
          document.getElementById("no_data").innerHTML = '';
        }
      }
    };
  
  //sending the post ajax request to practice page  
    xhttp.open("POST", "/practice", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    
    //sending data as sring in json format
    xhttp.send(JSON.stringify(query));
}

