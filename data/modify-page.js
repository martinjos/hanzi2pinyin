var hanziRange = '\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF';
var hanziRegexp = new RegExp('['+hanziRange+']+', 'g');

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
