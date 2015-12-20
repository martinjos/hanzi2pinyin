// In a distant and second-hand set of code-pages...
XRegExp.install('astral');

var CC_fullwidth_ascii = '\uFF01-\uFF5E';
var CC_fullwidth = CC_fullwidth_ascii; // for now
var CC_comma = ',\u3001\uFE10\uFE11\uFE50\uFE51\uFF0C\uFF64';
var CC_fullstop = '.\u3002\uFE12\uFE52\uFF0E\uFF61';
var CC_middledot = '\u00B7\u2E31\u30FB\uFF65';
var CC_colon = ':\uFE13\uFE55\uFF1A';
var CC_semicolon = ';\uFE14\uFE54\uFF1B';
var CC_anglequote_left = '\u00AB\u2039';
var CC_all_punct = CC_comma + CC_fullstop + CC_middledot + CC_colon +
                   CC_semicolon;

var hanziRegexp = new XRegExp('\\p{Han}[\\p{Han}\\p{Initial_Punctuation}\\p{Final_Punctuation}\\p{Open_Punctuation}\\p{Close_Punctuation}\\p{Space_Separator}'+CC_all_punct+CC_fullwidth+']*', 'g');

pinyinReceived = function(pinyinStr) {

    if (!document.body)
        return;

    var converter = new H2PConverter(pinyinStr);
    var found = filterTextNodes(document.body,
                                regexpConvertFilter(hanziRegexp, converter),
                                document);

}; // pinyinReceived = function (pinyin) { ...

function request(url, func) {
    var xhr = new XMLHttpRequest();
    try {
        xhr.onreadystatechange = function(){
            if (xhr.readyState != 4) {
                return;
            }

            if (xhr.responseText) {
                func(xhr.responseText);
            }
        };

        xhr.onerror = function(error) {
            console.error(error);
        };

        xhr.open("GET", url, true);
        xhr.send(null);
    } catch(e) {
        console.error(e);
    }
}

if (self.port)
    self.port.on('pinyin', pinyinReceived);
else
    request(chrome.extension.getURL('data/pinyin.json'), pinyinReceived);
