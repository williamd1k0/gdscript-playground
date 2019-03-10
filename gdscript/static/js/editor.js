
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
    history.pushState({code:code}, "Run Script", "/"+LZString.compressToEncodedURIComponent(code));
    document.querySelector('input[name=script]').value = code;
    console.log('CODE RUN');

    $.post(this.action, $(this).serialize(), function(result){
        console.log('CODE RESULT');
        console.log(result);
        $('textarea').val(result);
        var err = result.match(/At:\s<script>:(\d+)/);
        if (err !== null) {
          show_error(parseInt(err[1]));
        }
    });
});

console.log('EDITOR LOADED');