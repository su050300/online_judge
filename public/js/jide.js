// tracking number of rows in textarea

var text = document.createElement('div');
text.className = "row-sm-1 fonts";
text.innerHTML = 1;
var sel = document.getElementById("numbering");
sel.appendChild(text);

document.getElementById("txtarea").addEventListener("keydown", (key) => {
    sel = document.getElementById("numbering");
    var num = document.getElementById("txtarea").value.split("\n").length;
    var lengt = num;

    var text = document.createElement('div');
    text.className = "row-sm-1 fonts";
    text.innerHTML = num + 1;

    if (key.code == "Enter" || key.code == "NumpadEnter")
        sel.appendChild(text);
    else if (key.code == "Backspace" || key.code == "Delete") {
        setTimeout(() => {
            var childcoun = sel.childElementCount;
            var comp = document.getElementById("txtarea").value.split("\n").length;
            if (comp > childcoun) {
                for (let i = childcoun + 1; i <= comp; i++) {
                    var te = document.createElement('div');
                    te.className = "row-sm-1 fonts";
                    te.innerHTML = i;
                    sel.appendChild(te);
                }
            } else {
                for (let i = childcoun; i > comp; i--) {
                    if (sel.childElementCount > 1)
                        sel.removeChild(sel.lastChild);
                }
            }
        }, 20);

    }


});

document.getElementById("txtarea").onpaste = () => {
    setTimeout(() => {
        var childcoun = sel.childElementCount;
        var comp = document.getElementById("txtarea").value.split("\n").length;
        sel = document.getElementById("numbering");
        if (comp > childcoun) {
            for (var i = childcoun + 1; i <= comp; i++) {
                var text = document.createElement('div');
                text.className = "row-sm-1 fonts";
                text.innerHTML = i;
                sel.appendChild(text);
            }
        }
    }, 200);

};



//javascript to make textview scroll exactly like div element
var s1 = document.getElementById('txtarea');
var s2 = document.getElementById('numbering');

function txtareascroll() {
    s2.scrollTop = s1.scrollTop;
}

function numberingscroll() {
    s1.scrollTop = s2.scrollTop;
}

s1.addEventListener('scroll', txtareascroll);
s2.addEventListener('scroll', numberingscroll);


//setting font-size in the dropdown menu 
var fonts = document.getElementsByClassName("fonts");
var fontin = getComputedStyle(fonts[1]).fontSize;
var fontnum = fontin.substr(0, fontin.length - 2);
document.getElementById("fontsize").value = fontnum;
document.getElementById("fontsize").addEventListener('change', () => {
    var newvalue = document.getElementById("fontsize").value;

    newvalue += "px";
    fonts[1].style.fontSize = newvalue;
    fonts[2].style.fontSize = newvalue;

});
// ends here
//setting for theme
document.getElementById("light").addEventListener('click', function() {
    fonts[2].style.backgroundColor = "white";
    fonts[2].style.color = "black";
});
document.getElementById("dark").addEventListener('click', function() {
    fonts[2].style.backgroundColor = "#1f1f14";
    fonts[2].style.color = "#ccccb3";
});
//ends here