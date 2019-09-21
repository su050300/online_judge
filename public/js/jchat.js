// to set the scrollbar at the bottom
var scrol = document.querySelector(".friendchat");
scrol.scrollTop = scrol.scrollHeight;
// event listener on load to get the friends of the current user
window.addEventListener("load", getfriend);

var hitrefresh;
// function to get the friends of the current user
    function getfriend()
    { 
      var xhttp;
      xhttp = new XMLHttpRequest();
      xhttp.responseType='json';
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          document.querySelector(".friendlist").innerHTML="";
          var i=0;
          for(i=0;i<this.response.length;++i)
          {
            document.querySelector(".friendlist").innerHTML+='<li class="list-group-item cht-lt"><a class="friendname" onclick="getchat(this.id)" href="#" id="'+this.response[i].id +'">'+this.response[i].username+'</a></li>';
          }


        }
      };
      xhttp.open("POST", "/chat", true);
      xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhttp.send();
    }

// function to get the chat of the selected friend from the friend list
    function getchat(id){
      // AJAX call to th API
      var xhttp;
      xhttp = new XMLHttpRequest();
      xhttp.responseType='json';
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var messages=this.response;
            document.querySelector(".friendchat").innerHTML="";
            for (var i = 0; i < messages.length; i++) {
              var date=new Date(messages[i].date_time).toUTCString();
              date=date.slice(5,22);
               if(messages[i].receiver_id==id)
                   document.querySelector(".friendchat").innerHTML+='<div class="d-flex flex-row-reverse"><div class="col-lg-6 chat-snd text-right"><span class="sndbg">' + messages[i].message + '</span><p text-muted dated text-white py-1>' + date + '</p></div></div>';
                else {
                  document.querySelector(".friendchat").innerHTML+= '<div class="row"><div class="col-lg-6 chat-rcd"><span class="rcdbg">' + messages[i].message + '</span><p text-muted dated text-white py-1>' + date + '</p></div></div>';
                }

              }
              document.querySelector(".chatbutton").innerHTML="";
              document.querySelector("#username").innerHTML=document.getElementById(id).innerHTML;
              document.querySelector(".chatbutton").innerHTML+= '<div class="input-group"><textarea name="" type="text" class="form-control type_msg" id="sendmess" placeholder="Type your message..."></textarea><div class="input-group-append"><button class="input-group-text send_btn" type="submit" name="' + id + '" onclick="sendmessage(this.name)"><i class="fas fa-location-arrow"></i></button></div></div>';
            

              scrol.scrollTop = scrol.scrollHeight;

        }

      };
      clearInterval(hitrefresh);
      // setting interval to get the chat of the selected friend every second
      hitrefresh= setInterval(function(){
        refresh(id);
      },1000);
      xhttp.open("POST", 'chat/message', true);
      xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhttp.send("id="+id);

    }


// function to send the message
    function sendmessage(id){
      var message=document.getElementById("sendmess").value;
      var xhttp;
      xhttp = new XMLHttpRequest();
      xhttp.responseType='json';
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {

        }

      }
      xhttp.open("POST", 'chat/sendmessage', true);
      xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      var senddata="id="+id+"&message="+message;
      xhttp.send(senddata);
      getchat(id);
    }

// function to refresh the messages 
    function refresh(id){
      
      var xhttp;
      xhttp = new XMLHttpRequest();
      xhttp.responseType='json';
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var messages=this.response;
            document.querySelector(".friendchat").innerHTML="";
            for (var i = 0; i < messages.length; i++) {
              var date=new Date(messages[i].date_time).toUTCString();
              date=date.slice(5,22);

               if(messages[i].receiver_id==id)
                   document.querySelector(".friendchat").innerHTML+='<div class="d-flex flex-row-reverse"><div class="col-lg-6 chat-snd text-right"><span class="sndbg">' + messages[i].message + '</span><p text-muted dated text-white py-1>' + date + '</p></div></div>';
                else {
                  document.querySelector(".friendchat").innerHTML+= '<div class="row"><div class="col-lg-6 chat-rcd"><span class="rcdbg">' + messages[i].message + '</span><p text-muted dated text-white py-1>' + date + '</p></div></div>';
                }
              }
              var scrol = document.querySelector(".friendchat");

              scrol.scrollTop = scrol.scrollHeight;
          }

      };
      xhttp.open("POST", 'chat/message', true);
      xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhttp.send("id="+id);

    }

