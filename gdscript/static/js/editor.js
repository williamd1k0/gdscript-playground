
var editor;
var err_decorations = [];

require.config({ paths: { 'vs': '/static/js/monaco/min/vs' }});

function show_error(line) {
    err_decorations = editor.deltaDecorations(err_decorations, [
        {
            range: new monaco.Range(line, 1, line, 1),
            options: {
                isWholeLine: true,
                className: 'editor.error-line',
                glyphMarginClassName: 'editor.error-panel'
            }
        }
    ]);
}

function clear_error(){
    err_decorations = editor.deltaDecorations(err_decorations, []);
}

function init_editor(container) {

    monaco.languages.register({ id: 'gdscript' });
    monaco.languages.setMonarchTokensProvider('gdscript', gdscript);

    monaco.editor.defineTheme('godot', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'predefined', foreground: 'dcdcaa' },
        ]
    });
    
    var code_injection = LZString.decompressFromEncodedURIComponent(location.pathname.substring(1));
    var sample = [
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

    if (code_injection) {
        sample = code_injection;
    }

    window.editor = monaco.editor.create(container, {
        value: sample,
        language: 'gdscript',
        theme: 'godot',
        glyphMargin: true,
    });
    window.editor.onDidChangeCursorPosition(function(){
    	if (err_decorations.length > 0){
    		clear_error();
    	}
    });
}

require(['vs/editor/editor.main'], init_editor.bind(null, document.getElementById('container')));


$("form").on("submit", function(event) {
    event.preventDefault();
    var code = window.editor.getValue();
    document.querySelector('input[name=script]').value = code;

    $.post(this.action, $(this).serialize(), function(result){
        
        var err_line = result.match(/At:\s<script>:(\d+)/);
        if (err_line !== null) {
            var err_info = result.split('\n');
            err_info = err_info[err_info.length-2].split(':');
            var err_name = err_info.shift();
            var err_msg = err_info.join(':').trim();
            $('textarea').val(err_msg);
            $('textarea').addClass('error');
            show_error(parseInt(err_line[1]));
            var err = new Error(err_msg, '<gdscript>', parseInt(err_line[1]));
            throw err;
        } else {
            $('textarea').val(result);
            $('textarea').removeClass('error');
        }
    });
});

$(".share").on("click", function(event) {
    var code = window.editor.getValue();
    var url = location.host+"/"+LZString.compressToEncodedURIComponent(code);
    $('textarea').val('[Share]\n\n'+url);
    $('textarea').removeClass('error');
});
