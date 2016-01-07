var defaultExcludeTags = {
    style: true, script: true, iframe: true, textarea: true,
    select: true, option: true
};

function filterTextNodes(elem, filter, doc, excludeTags) {
    if (excludeTags === undefined)
        excludeTags = defaultExcludeTags;
    var child = elem.firstChild;
    var found = false;
    var first = true;
    while (child) {
        if (child.nodeType == 3) { // text
            var array = filter(doc, child, first, child.nextSibling == null);
            if (array.length != 1 || array[0] != child) {
                found = true;
                var nextChild = child.nextSibling;
                elem.removeChild(child);
                for (var i in array) {
                    elem.insertBefore(array[i], nextChild);
                }
                child = array[array.length - 1];
            }
        } else if (child.nodeType == 1) { // element
            if ( !excludeTags[ child.tagName.toLowerCase() ] )
                found = found | filterTextNodes(child, filter, doc);
        }
        child = child.nextSibling;
        first = false;
    }
    return found;
}

if (typeof(exports) != 'undefined')
    exports.filterTextNodes = filterTextNodes;
