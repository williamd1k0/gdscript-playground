
var EDITOR;
var SAMPLE = [
	'extends Node',
	'',
	'# class member variables go here, for example:',
	'# var a = 2',
	'# var b = "textvar"',
	'',
	'func _ready():',
	'	# Called every time the node is added to the scene.',
	'	# Initialization here',
	'	pass',
	''
].join('\n');

function show_error(line) {
	EDITOR.markText({line:line, ch:0}, {line:line, ch:null}, {
		css: 'background-color: rgb(138, 26, 69)',
		clearOnEnter: true,
	});
}

$(document).ready(function() {
	var code_injection = LZString.decompressFromEncodedURIComponent(location.pathname.substring(1));
	var sample = code_injection ? code_injection : SAMPLE;
	EDITOR = CodeMirror(document.querySelector('#editor'), {
		lineNumbers: true,
		indentUnit: 4,
		indentWithTabs: true,
		scrollbarStyle: 'null',
		theme: 'dracula',
		mode:  "gdscript",
		value: sample,
	});

	EDITOR.setOption("extraKeys", {
		'Ctrl-Enter': function(cm) {
		  $("form#run-script").submit();
		}
	});

	$(".share").on("click", function(event) {
		var code = EDITOR.getValue();
		var url = location.protocol+'//'+location.host+"/"+LZString.compressToEncodedURIComponent(code);
		$('#share-url').text(url);
		document.querySelector('#share-url').href = url;
	});

	$("#new-script").on("click", function(event) {
		EDITOR.setValue(SAMPLE);
		OUTPUT.setValue('');
	});

});

