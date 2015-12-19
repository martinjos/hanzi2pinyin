function H2PConverter(pinyinStr) {
    this.pinyin = JSON.parse(pinyinStr);
    this.maxLength = 4;
}

H2PConverter.prototype.splicePinyin = function(first) {
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
            if (!this.first)
                this.r += " ";
            this.r += pinyinWord;
            break;
        }
    }
    this.first = false;
};

H2PConverter.prototype.convert = function(k) {
    this.r = "";
    this.current = "";
    this.first = true;
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
    var r = this.r;

    // clean up
    this.r = null;
    this.current = null;

    return r;
};

if (typeof(exports) != 'undefined')
    exports.H2PConverter = H2PConverter;
