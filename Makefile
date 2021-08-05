all:
	cp src/webcam-easy.js dist/webcam-easy.js
	uglifyjs --compress --mangle -- src/webcam-easy.js > dist/webcam-easy.min.js
