
function get_external_script_source() {
    if (location.search.match(/rentry=(.+)&?/)) {
        return "rentry";
    }
    if (location.search.length > 2) {
        return "lz";
    }
    return undefined;
}

function has_external_script() {
    return get_external_script_source() !== undefined;
}

function fetch_external_script() {
    let source = get_external_script_source();
    if (source === undefined) return;
    switch (source) {
        case "lz":
            EDITOR.setValue(LZString.decompressFromEncodedURIComponent(location.search.substring(1)));
        break;
        case "rentry":
            var rentry_raw = "https://rentry.co/api/raw/" + location.search.match(/rentry=(.+)&?/)[1];
            $.get(rentry_raw, function(result) {
                if (result.status === "200") {
                    EDITOR.setValue(result.content);
                }
            });
        break;
    }
}