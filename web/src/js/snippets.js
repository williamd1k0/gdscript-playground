
var SNIPPETS = [
	[
		"Hello World",
		["extends Node",
		"# - Hello, World!",
		"# The well-known \"Hello, World\" program.",
		"",
		"func _ready():",
		"	# Called every time the node is added to the scene.",
		"	print(\"Hello, World!\")",
		""].join("\n")
	],
	[
		"Arrays",
		["extends Node",
		"# - Array",
		"# Generic sequence of arbitrary object types.",
		"# The array can resize dynamically.",
		"# Arrays are indexed starting from index 0.",
		"# Negative indices count from the end.",
		"# Related docs: https://kutt.it/gdscript-array",
		"",
		"func _ready():",
		"	var arr = []",
		"	arr = [1, 2, 3]",
		"	var b = arr[1] # This is 2.",
		"	var c = arr[arr.size() - 1] # This is 3.",
		"	var d = arr[-1] # Same as the previous line, but shorter.",
		"	prints(b, c, d)",
		"	arr[0] = \"Hi!\" # Replacing value 1 with \"Hi!\".",
		"	arr.append(4) # Array is now [\"Hi!\", 2, 3, 4].",
		"	print(arr)",
		""].join("\n")
	],
	[
		"Dictionaries",
		["extends Node",
		"# - Dictionary",
		"# Associative container which contains values referenced by unique keys.",
		"# Dictionary are composed of pairs of keys (which must be unique) and values.",
		"# Related docs: https://kutt.it/gdscript-dictionary",
		"",
		"func _ready():",
		"	# Define a new Dictionary using curly braces {}",
		"	var d = {\"A key\": \"A value\", 4: 5, 28: [1, 2, 3]}",
		"	d[\"Hi!\"] = 0 # Insert new key-value pair",
		"	print(d)",
		"	print(d[\"Hi!\"])",
		"	d = {",
		"		22: \"value\",",
		"		\"some_key\": 2,",
		"		\"other_key\": [2, 3, 4],",
		"		\"more_key\": \"Hello\"",
		"	}",
		"	print(d.keys()) # Get all keys as an array",
		"	print(d.values()) # Get all values as an array",
		""].join("\n")
	]
];

$(document).ready(function() {
	var menu = $("#menu-snippets");
	// <a class="dropdown-item" href="#">Hello World</a>
	for (var i in SNIPPETS) {
		var a = document.createElement('a');
		a.href = '#';
		a.classList.add('dropdown-item');
		a.classList.add('bg-dark');
		a.textContent = SNIPPETS[i][0];
		$(a).on('click', click_callback.bind(null, SNIPPETS[i][1]));
		menu.append(a);
	}
	
	function click_callback(code) {
		EDITOR.setValue(code);
		OUTPUT.setValue('');
	}
});