var ELEMENT_NODE = 1;
var TEXT_NODE = 3;

var CrossTagsArray = 'a abbr b br del dfn em i ins mark q s small span strong sub sup time u var wbr'.split(' ');
var CrossTags = {};
for (var i in CrossTagsArray) CrossTags[CrossTagsArray[i]] = true;
var DirectionSiblings = ['previousSibling', 'nextSibling'];
var DirectionChildren = ['lastChild', 'firstChild'];

function nextNode(state, direction) {
    var node = null;
    var pos;
    if (state.node.nodeType == ELEMENT_NODE &&
        state.pos == 1 - direction && state.node.firstChild) {

        node = state.node[DirectionChildren[direction]];
        pos = 1 - direction;

    } else if (state.node[DirectionSiblings[direction]]) {

        node = state.node[DirectionSiblings[direction]];
        pos = 1 - direction;

    } else {
        node = state.node.parentElement;
        pos = direction;
    }
    if (node &&
        node.nodeType == ELEMENT_NODE &&
        !CrossTags[node.tagName.toLowerCase()]) {

        node = null;
    }
    return { node: node, pos: pos };
}

function nodeDepth(node) {
    var depth = 0;
    while (node != null &&
           (node.nodeType != ELEMENT_NODE ||
            node.tagName.toLowerCase() != 'body')) {
        node = node.parentElement;
        depth++;
    }
    return depth;
}

function nextTextNode(node, direction) {
    var topNode = node;
    var topDepth = nodeDepth(topNode);
    var state = nextNode({ node: node, pos: direction }, direction);
    if (state.node) {
        var newDepth = nodeDepth(state.node);
        if (newDepth < topDepth) {
            topNode = state.node;
            topDepth = newDepth;
        }
    }
    while (state.node !== null && state.node.nodeType != TEXT_NODE) {
        state = nextNode(state, direction);
        if (state.node) {
            var newDepth = nodeDepth(state.node);
            if (newDepth < topDepth) {
                topNode = state.node;
                topDepth = newDepth;
            }
        }
    }
    return { node: state.node, topNode: topNode, topDepth: topDepth };
}

function findNextChar(node, direction) {
    var topNode = node;
    var topDepth = nodeDepth(topNode);
    var info = nextTextNode(node, direction);
    node = info.node;
    if (info.topDepth < topDepth) {
        topNode = info.topNode;
        topDepth = info.topDepth;
    }
    while (node && node.data.length == 0) {
        var lastNode = node;
        info = nextTextNode(node, direction);
        node = info.node;
        if (info.topDepth < topDepth) {
            topNode = info.topNode;
            topDepth = info.topDepth;
        }
    }
    var idx = 0;
    if (node) idx = direction == 0 ? node.length - 1 : 0;
    return { ch: node && node.data[idx], topNode: topNode };
}

function isRightSpacing(ch) {
    var rightSpacing = true;
    if (!ch) {
        rightSpacing = false;
    } else if (!ch.match(new XRegExp('[ \\p{Letter} \\p{Number} ]', 'x'))) {
        if (typeof(PunctuationType[ch]) != 'undefined') {
            if ((PunctuationType[ch] & RIGHT_SPACING) == 0)
                rightSpacing = false;
        } else if (ch.match(new XRegExp('[ \\p{Initial_Punctuation} \\p{Open_Punctuation} \\p{Dash_Punctuation} \\p{White_Space} ]', 'x'))) {
            rightSpacing = false;
        }
    }
    return rightSpacing;
}

function isLeftSpacing(ch) {
    var leftSpacing = true;
    if (!ch) {
        leftSpacing = false;
    } else if (!ch.match(new XRegExp('[ \\p{Letter} \\p{Number} ]', 'x'))) {
        if (typeof(PunctuationType[ch]) != 'undefined') {
            if ((PunctuationType[ch] & LEFT_SPACING) == 0)
                leftSpacing = false;
        } else if (ch.match(new XRegExp('[ \\p{Final_Punctuation} \\p{Close_Punctuation} \\p{Dash_Punctuation} \\p{White_Space} ]', 'x'))) {
            leftSpacing = false;
        }
    }
    return leftSpacing;
}

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

            var lastRightSpacing = true;
            var lastInsPos = null;
            if (matches.index == 0) {
                var info = findNextChar(child, 0);
                lastRightSpacing = isRightSpacing(info.ch);
                lastInsPos = info.topNode;
            }

            function insertSpaceBefore() {
                if (lastInsPos !== null) {
                    lastInsPos.parentElement.insertBefore(
                        doc.createTextNode(' 1 '),
                        lastInsPos
                    );
                } else {
                    result.push(document.createTextNode(' 2 '));
                }
            }

            for (var i = 0; i < r.words.length; i++) {
                if (r.words[i] == '') {
                    var punct = r.pinyinWords[i];
                    if (lastRightSpacing && isLeftSpacing(punct)) {
                        insertSpaceBefore();
                    }
                    result.push(document.createTextNode(punct));
                    lastRightSpacing = isRightSpacing(punct);
                } else {
                    if (lastRightSpacing) {
                        insertSpaceBefore();
                    }
                    var span = document.createElement('span');
                    span.setAttribute('title', r.words[i]);
                    span.appendChild(document.createTextNode(r.pinyinWords[i]));
                    result.push(span);
                    lastRightSpacing = true;
                }
                lastInsPos = null;
            }
        }

        if (pos == 0) {
            result.push(child);
        } else {
            if (pos < text.length) {
                result.push(document.createTextNode(text.substr(pos)));
            }
        }

        return result;
    };
}

if (typeof(exports) != 'undefined')
    exports.regexpConvertFilter = regexpConvertFilter;
