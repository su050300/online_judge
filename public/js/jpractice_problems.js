window.addEventListener("load", getproblems);

function getproblems() {
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        // readystate denotes that the request is completed and the data is received and request is ok for status 200
        if (this.readyState == 4 && this.status == 200) {
            //displaying the response coming of the request
            document.getElementById("problem-list").innerHTML = this.responseText;

        }
    };

    //sending the post ajax request to the same page  
    xhttp.open("POST", window.location.href, true);
    xhttp.send();
}