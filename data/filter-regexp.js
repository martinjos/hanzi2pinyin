function regexpConvertFilter(regexp, converter) {
    return function (doc, child) {
        var text = child.data;

        var pos = 0;
        var result = [];
        var found = false;
        var matches;

        while ((matches = regexp.exec(text)) !== null) {
            var intermediate = text.substr(pos, matches.index - pos);
            if (intermediate.length > 0) {
                result.push(document.createTextNode(intermediate));
            }
            pos = regexp.lastIndex;
            k = matches[0];

            r = converter.convert(k);

            result.push(document.createTextNode(' '));
            for (var i = 0; i < r.words.length; i++) {
                if (i > 0)
                    result.push(document.createTextNode(' '));
                var span = document.createElement('span');
                span.setAttribute('title', r.words[i]);
                span.appendChild(document.createTextNode(r.pinyinWords[i]));
                result.push(span);
            }
            result.push(document.createTextNode(' '));
        }

        if (pos == 0) {
            result.push(child);
        } else if (pos < text.length) {
            result.push(document.createTextNode(text.substr(pos)));
        }

        return result;
    };
}

if (typeof(exports) != 'undefined')
    exports.regexpConvertFilter = regexpConvertFilter;
