//for the password show eye button

document.querySelector("#eye").addEventListener("click", showpassword);
var count = 0;

function showpassword() {
    var obj = document.querySelector("#aye").classList;
    if (count % 2 == 0) {
        document.querySelector("#password").setAttribute("type", "text");
        console.log(obj[1]);
        obj.value = "fa-eye-slash pt-1";
    } else {
        document.querySelector("#password").setAttribute("type", "password");
        obj.value = "fa-eye pt-1";
    }
    count++;
}