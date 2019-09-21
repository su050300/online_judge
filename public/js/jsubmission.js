//getproblems() to get the submissions of a particular problem along with the submission status

getproblems();

function getproblems(){
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.responseType = "json";
    xhttp.onreadystatechange = function() {
    
    // readystate denotes that the request is completed and the data is received and request is ok for status 200        
    if (this.readyState == 4 && this.status == 200) {
      if (this.response.senddata === '0'){
        document.getElementById("thead").style.display = 'none';
        document.getElementById("arrows").style.display = 'none';
        document.getElementById("no_data").innerHTML = 'No submission';
        
      }
      else{
          var stat;
          this.response.forEach(function(element){
              if(element.date_time)
                element.datetime=element.date_time;
              switch (element.status){
                  case 'AC':stat='AC✔';break;
                  case 'RE':stat='RE⚠️';break;
                  case 'CE':stat='CE🚫';break;
                  case 'TLE':stat='TLE⏲️';break;
                  case 'WA':stat='WA❌';break;
              }
                document.getElementById("problem-list").innerHTML+='<tr><td><a href = "window.location.redirect = window.location.href+/../submission/'+element.id+'">'+element.problem_name+'</a></td><td>'+element.language+'</td><td>'+element.datetime+'</td><td>'+stat+'</td></tr>'              
          });
        
    }
  }
  };

//sending the post ajax request to the same page    
xhttp.open("POST", window.location.href, true);
xhttp.send();
}

