//  body
window.addEventListener("load", get_contest_problems);



//exist challenge
document.querySelector("#exist_challenge").addEventListener("click", existing_challenges);



//new challenge
document.querySelector("#new_challenge").addEventListener("click", () => {
    window.location = '/contest/add_challenge/new_challenge';
});



//existing challenges search
document.querySelector("#search_existing").addEventListener("keyup", search_problems);
var count = 0;

//function for existing challenge
function existing_challenges() {
    console.log(count);
    if (count % 2 == 0)
        document.getElementById('existing_challenge').style.display = 'block';
    else
        document.getElementById('existing_challenge').style.display = 'none';
    count++;
}

//function for search problem
function search_problems() {
    var search = document.getElementById('search_existing').value;
    if (search) {
        var xhttp;
        xhttp = new XMLHttpRequest();
        xhttp.responseType = "json";
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.querySelector(".problems").innerHTML = "";
                for (var i = 0; i < 6 && i < this.response.length; ++i)
                    document.querySelector(".problems").innerHTML += '<div class="problem_item" id="' + this.response[i].problem_id + '" onclick="select_problem(this.id)">' + this.response[i].problem_name + '</div>';
                
            }
        };
        
        xhttp.open("POST", "/contest/add_challenge", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("search=" + search);

    } else {
        document.querySelector(".problems").innerHTML = "";
    }
}


//function for select problems using id
function select_problem(id) {

    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert('Challenge ' + document.getElementById(id).innerHTML + ' added successfully');
            document.getElementById('search_existing').value = "";
            document.querySelector(".problems").innerHTML = "";
            get_contest_problems();
        }
    };
    xhttp.open("POST", "/contest/add_challenge/select_existing_challenge", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("problem_id=" + id);
}


//function for get contest problems
function get_contest_problems() {
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.responseType = "json";
    var rows;

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            rows = this.response;
            var points;
            document.getElementById('verified_problems').innerHTML = "";
            rows.rows1.forEach(function(element) {
                switch (element.difficulty) {
                    case 'easy':
                        points = 30;
                        break;
                    case 'medium':
                        points = 60;
                        break;
                    case 'hard':
                        points = 100;
                        break;

                }
                document.getElementById('verified_problems').innerHTML += '<tr><td>' + element.problem_name + '</td><td>' + element.subdomain + '</td><td>' + element.difficulty + '</td><td>' + points + '</td></tr>';
            });
            document.getElementById('pending_problems').innerHTML = "";
            rows.rows2.forEach(function(element) {
                switch (element.difficulty) {
                    case 'easy':
                        points = 30;
                        break;
                    case 'medium':
                        points = 60;
                        break;
                    case 'hard':
                        points = 100;
                        break;

                }
                document.getElementById('pending_problems').innerHTML += '<tr><td>' + element.problem_name + '</td><td>' + element.subdomain + '</td><td>' + element.difficulty + '</td><td>' + points + '</td></tr>';
            });
        }
    };
    xhttp.open("POST", "/contest/add_challenge/get_challenge", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
}
