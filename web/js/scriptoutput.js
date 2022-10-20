
var OUTPUT;

$(document).ready(function() {
	OUTPUT = CodeMirror(document.querySelector('#console'), {
		lineNumbers: false,
		indentUnit: 4,
		indentWithTabs: true,
		scrollbarStyle: 'null',
		readOnly: 'nocursor',
		theme: 'night',
		value: '',
		inputStyle: 'contenteditable',
	});
	
	$("form#run-script").on("submit", function(event) {
		event.preventDefault();
		OUTPUT.setValue('');
		var code = EDITOR.getValue();
		document.querySelector('input[name=code]').value = code;
		document.querySelector('#spinner').classList.add('active');
		$.post(this.action, $(this).serialize(), function(result){
			document.querySelector('#spinner').classList.remove('active');
			switch(result.result) {
				case 'ok':
					var output = result.output.trim();
					if (!output) output = 'None';
					OUTPUT.setValue(output);
					break;
				case 'error':
					OUTPUT.setValue(result.message);
					show_error(result.line-1);
					throw new Error(result.error+': '+result.message, '<gdscript>', result.line);
				default:
					console.error('Unknown response.');
					console.error(result);
			}
		});
	});

	$.get("https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-f1a44419-c8a0-4cf5-b9af-d12c7a947ca8/godot/version", function(result) {
		document.querySelector("#godot-version").textContent = result;
	});
});
