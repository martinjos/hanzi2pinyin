NAME=hanzi2pinyin

BUILD_CHROME=build_chrome/$(NAME)
BUILD_FIREFOX=build_firefox
CHROME_ZIPFILE=$(BUILD_CHROME)/../$(NAME).zip

FIREFOX_BIN=/usr/lib/firefox/firefox

all: firefox chrome

firefox:
	rm -rf $(BUILD_FIREFOX)
	mkdir -p $(BUILD_FIREFOX)
	cp -a package.json index.js data icons LICENSE.txt $(BUILD_FIREFOX)
	( cd $(BUILD_FIREFOX) && jpm xpi )

chrome:
	rm -f $(CHROME_ZIPFILE)
	rm -rf $(BUILD_CHROME)
	mkdir -p $(BUILD_CHROME)
	cp -a manifest.json data _locales icons LICENSE.txt $(BUILD_CHROME)
	( cd $(BUILD_CHROME)/.. && zip $(NAME).zip -r $(NAME) )

test:
	jpm test -b $(FIREFOX_BIN)

.PHONY: all firefox chrome test
