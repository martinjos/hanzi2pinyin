function regexpConvertFilter(regexp, converter) {
    return function (doc, child, isFirstNode, isLastNode) {
        var text = child.data;

        var pos = 0;
        var result = [];
        var found = false;
        var matches;

        while ((matches = regexp.exec(text)) !== null) {
            var intermediate = text.substr(pos, matches.index - pos);
            if (intermediate.length > 0) {
                result.push(document.createTextNode(intermediate));
                isFirstNode = false;
            }
            pos = regexp.lastIndex;
            k = matches[0];

            r = converter.convert(k);

            var lastWasPunct = isFirstNode;
            for (var i = 0; i < r.words.length; i++) {
                if (r.words[i] == '') {
                    result.push(document.createTextNode(r.pinyinWords[i]));
                    lastWasPunct = true;
                } else {
                    if (!lastWasPunct)
                        result.push(document.createTextNode(' '));
                    var span = document.createElement('span');
                    span.setAttribute('title', r.words[i]);
                    span.appendChild(document.createTextNode(r.pinyinWords[i]));
                    result.push(span);
                    lastWasPunct = false;
                }
            }
            if (!lastWasPunct && (!isLastNode || pos < text.length))
                result.push(document.createTextNode(' '));
            isFirstNode = false;
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
