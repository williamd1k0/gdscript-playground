
var SNIPPETS = [
    [
        "Hello World",
        "extends Node\n\nfunc _ready():\n\tprint('Hello World!')\n"
    ],
];

$(document).ready(function() {
    var menu = $("#menu-snippets");
    // <a class="dropdown-item" href="#">Hello World</a>
    for (var i in SNIPPETS) {
        var a = document.createElement('a');
        a.href = '#';
        a.classList.add('dropdown-item');
        a.textContent = SNIPPETS[i][0];
        $(a).on('click', click_callback.bind(null, SNIPPETS[i][1]));
        menu.append(a);
    }
    
    function click_callback(code) {
        EDITOR.setValue(code);
        OUTPUT.setValue('');
    }
});