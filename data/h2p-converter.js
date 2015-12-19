function H2PConverter(pinyinStr) {
    this.pinyin = JSON.parse(pinyinStr);
    this.maxLength = 4;
}

var punctuation = {
    '　': ' ',
    '、': ', ',
    '。': '. ',
    '〈': ' ‹',
    '〉': '› ',
    '《': ' «',
    '》': '» ',
    '「': " ‘",
    '」': "’ ",
    '『': ' “',
    '』': '” ',
    '【': ' [',
    '】': '] ',
    '〔': ' (',
    '〕': ') ',
    '〖': ' {',
    '〗': '} ',
    '〘': ' {',
    '〙': '} ',
    '〚': ' [',
    '〛': '] ',
    '〜': '—',
    '〝': ' “',
    '〞': '” ',
    '〟': '” ',
    '︰': ': ',

    // full-width punctuation
    '！': '! ',
    '＄': ' $',
    '％': '% ',
    '（': ' (',
    '）': ') ',
    '，': ', ',
    '．': '. ',
    '：': ': ',
    '；': '; ',
    '？': '? ',
    '［': ' [',
    '］': '] ',
    '｛': ' {',
    '｝': '} ',
};

H2PConverter.prototype.splicePinyin = function(first) {
    var firstChar = this.current.charAt(0);
    var firstCharCode = firstChar.charCodeAt(0);
    if (punctuation[firstChar] !== undefined) {
        this.current = this.current.substr(1);
        this.words.push('');
        this.pinyinWords.push(punctuation[firstChar]);
        return;
    } else if (firstCharCode >= 0xff01 && firstCharCode <= 0xff5e) {
        // full-width form
        var newCode = firstChar.charCodeAt(0) - 0xfee0;
        var newForm = String.fromCharCode(newCode);
        if (!(newCode >= 0x30 && newCode <= 0x39) &&
            !(newCode >= 0x41 && newCode <= 0x5A) &&
            !(newCode >= 0x61 && newCode <= 0x7A)) {
            newForm = ' ' + newForm + ' ';
        }
        this.current = this.current.substr(1);
        this.words.push('');
        this.pinyinWords.push(newForm);
    }
    for (var j = this.maxLength; j >= 1; j--) {
        var word = this.current.substr(0, j);
        var pinyinWord = null;
        if (typeof(this.pinyin[word]) != 'undefined') {
            pinyinWord = this.pinyin[word];
        } else if (j == 1) {
            // fallback
            pinyinWord = word;
        }
        if (pinyinWord !== null) {
            this.current = this.current.substr(j);
            this.words.push(word);
            this.pinyinWords.push(pinyinWord);
            break;
        }
    }
};

H2PConverter.prototype.convert = function(k) {
    this.words = [];
    this.pinyinWords = [];
    this.current = "";
    for (var i = 0; i < k.length; i++) {
        var ch = k.charAt(i);
        this.current += ch;
        if (this.current.length >= this.maxLength) {
            this.splicePinyin();
        }
    }
    while (this.current.length > 0) {
        this.splicePinyin();
    }
    var result = { words: this.words, pinyinWords: this.pinyinWords };

    // clean up
    this.words = null;
    this.pinyinWords = null;
    this.current = null;

    return result;
};

if (typeof(exports) != 'undefined')
    exports.H2PConverter = H2PConverter;
