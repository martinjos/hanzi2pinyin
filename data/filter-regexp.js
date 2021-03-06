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

function reverseString(str) {
    var chars = [];
    for (var i = str.length; i >= 0; i--) {
        chars.push(str[i]);
    }
    return chars.join('');
}

function findMatchChar(text, direction, regexp) {
    if (direction === 0) {
        text = reverseString(text);
    }
    var m = text.match(regexp);
    var ch = null;
    if (m !== null) {
        ch = m[0];
    }
    return ch;
}

function findNextChar(node, direction, regexp) {
    if (regexp === undefined || regexp === null) {
        regexp = /[\S\s]/;
    }
    var topNode = node;
    var topDepth = nodeDepth(topNode);
    var info = nextTextNode(node, direction);
    node = info.node;
    if (info.topDepth < topDepth) {
        topNode = info.topNode;
        topDepth = info.topDepth;
    }
    var ch = null;
    while (node) {
        ch = findMatchChar(node.data, direction, regexp);
        if (ch !== null)
            break;

        var lastNode = node;
        info = nextTextNode(node, direction);
        node = info.node;
        if (info.topDepth < topDepth) {
            topNode = info.topNode;
            topDepth = info.topDepth;
        }
    }
    return { ch: ch, topNode: topNode };
}

function isRightSpacing(ch) {
    var rightSpacing = true;
    if (null === ch || undefined === ch) {
        rightSpacing = false;
    } else if (null === ch.match(new XRegExp('[\\p{Letter}\\p{Number}]'))) {
        if (typeof(PunctuationType[ch]) != 'undefined') {
            if ((PunctuationType[ch] & RIGHT_SPACING) == 0)
                rightSpacing = false;
        } else if (null !== ch.match(new XRegExp('[\\p{Initial_Punctuation}\\p{Open_Punctuation}\\p{Dash_Punctuation}\\p{White_Space}]'))) {
            rightSpacing = false;
        }
    }
    return rightSpacing;
}

function isLeftSpacing(ch) {
    var leftSpacing = true;
    if (null === ch || undefined === ch) {
        leftSpacing = false;
    } else if (null === ch.match(new XRegExp('[\\p{Letter}\\p{Number}]'))) {
        if (typeof(PunctuationType[ch]) != 'undefined') {
            if ((PunctuationType[ch] & LEFT_SPACING) == 0)
                leftSpacing = false;
        } else if (null !== ch.match(new XRegExp('[\\p{Final_Punctuation}\\p{Close_Punctuation}\\p{Dash_Punctuation}\\p{White_Space}]'))) {
            leftSpacing = false;
        }
    }
    return leftSpacing;
}

var CapChars = '.!?‹«';
var CapRegexp = new XRegExp('['+CapChars+'\\p{Letter}\\p{Number}]');

function regexpConvertFilter(regexp, converter) {
    return function (doc, child) {
        var text = child.data;

        var pos = 0;
        var result = [];
        var found = false;
        var matches;

        var info = findNextChar(child, 0);
        var lastRightSpacing = isRightSpacing(info.ch);
        var lastInsPos = info.topNode;

        var info = findNextChar(child, 0, CapRegexp);
        var lastCap = info.ch === null ||
                      CapChars.indexOf(info.ch) != -1;

        function insertSpaceBefore() {
            if (lastInsPos !== null) {
                lastInsPos.parentElement.insertBefore(
                    doc.createTextNode(' '),
                    lastInsPos
                );
            } else {
                result.push(document.createTextNode(' '));
            }
        }

        while ((matches = regexp.exec(text)) !== null) {

            var intermediate = text.substr(pos, matches.index - pos);
            if (intermediate.length > 0) {
                if (isLeftSpacing(intermediate[0]) && lastRightSpacing) {
                    insertSpaceBefore();
                }
                result.push(document.createTextNode(intermediate));
                lastRightSpacing =
                    isRightSpacing(intermediate[intermediate.length - 1]);
                var lastCapChar = findMatchChar(intermediate, 0, CapRegexp);
                if (lastCapChar !== null)
                    lastCap = (CapChars.indexOf(lastCapChar) != -1)
                lastInsPos = null;
            }
            pos = regexp.lastIndex;
            k = matches[0];

            r = converter.convert(k);

            for (var i = 0; i < r.words.length; i++) {
                if (r.words[i] == '') {
                    var punct = r.pinyinWords[i];
                    if (lastRightSpacing && isLeftSpacing(punct)) {
                        insertSpaceBefore();
                    }
                    result.push(document.createTextNode(punct));
                    lastRightSpacing = isRightSpacing(punct);
                    if (CapChars.indexOf(punct) != -1)
                        lastCap = true;
                } else {
                    if (lastRightSpacing) {
                        insertSpaceBefore();
                    }
                    var span = document.createElement('span');
                    span.setAttribute('title', r.words[i]);
                    var word = r.pinyinWords[i];
                    if (lastCap)
                        word = word[0].toUpperCase() + word.substr(1);
                    span.appendChild(document.createTextNode(word));
                    result.push(span);
                    lastRightSpacing = true;
                    lastCap = false;
                }
                lastInsPos = null;
            }
        }

        if (pos < text.length && isLeftSpacing(text[pos]) && lastRightSpacing) {
            insertSpaceBefore();
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
