
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
	});
	
	$("form#run-script").on("submit", function(event) {
		event.preventDefault();
		OUTPUT.setValue('');
		var code = EDITOR.getValue();
		document.querySelector('input[name=script]').value = code;

		$.post(this.action, $(this).serialize(), function(result){
			switch(result.result) {
				case 'ok':
					var output = result.output.trim();
					if (!output) output = 'None';
					OUTPUT.setValue(output);
					break;
				case 'error':
					OUTPUT.setValue(result.message);
					show_error(result.line-1);
					var err = new Error(result.error+': '+result.message, '<gdscript>', result.line);
					throw err;
				default:
					console.error('Unknown response.');
					console.error(result);
			}
		});
	});
});
