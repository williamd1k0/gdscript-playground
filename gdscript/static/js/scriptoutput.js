
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
            var err_line = result.match(/At:\s<script>:(\d+)/);
            if (err_line !== null) {
                var err_info = result.split('\n');
                err_info = err_info[err_info.length-2].split(':');
                var err_name = err_info.shift();
                var err_msg = err_info.join(':').trim();
                OUTPUT.setValue(err_msg);
                show_error(parseInt(err_line[1])-1);
                $('.toast').toast('show');
                var err = new Error(err_msg, '<gdscript>', parseInt(err_line[1]));
                throw err;
            } else {
                if (!result.trim()) result = 'None';
                OUTPUT.setValue(result);
            }
        });
    });
});
