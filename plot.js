const fs = require('fs');
const png = require('pngjs').PNG;

const colormap = function(x, buffer, index, color) {
	var mask = [1,1,1];
	if (color == 'r') {
		mask = [0,1,1];
	} else if (color == 'b') {
		mask = [1,1,0];
	} else if (color == 'grey') {
		mask = [0.5,0.5,0.5];
	}
	var r = 255*Math.sqrt(Math.min(Math.max(x,0),1));
	buffer[index] = Math.round(255-r*mask[0]);
	buffer[index+1] = Math.round(255-r*mask[1]); //Math.round(255*Math.max(	1-Math.abs(x-0.5),0	));
	buffer[index+2] = Math.round(255-r*mask[2]); //Math.round(255*Math.max(0.5-2*x,0));
	buffer[index+3] = 255; // alpha channel
}

const minmax = function(a,nDim) {
	// return the extrema of a 1D or 2D array.
	var norm = [0, 0];
	for (var x = 0; x < a.length; x++) {
		if (nDim == 1) {
			norm[0] = Math.min(a[x], norm[0]);
			norm[1] = Math.max(a[x], norm[1]);
		} else if (nDim == 2) {
			for (var y = 0; y < a[0].length; y++) {
				norm[0] = Math.min(a[x][y], norm[0]);
				norm[1] = Math.max(a[x][y], norm[1]);
			}
		}
	}
	return norm;
}

const drawMarker = function(img, x, y, radius) {
	//console.log("draw marker x=" + x + " y=" + y);
	colormap(1, img.data, ((img.width * (img.height-1-y) + x) << 2), 'b');
	if (radius > 1) {
		drawMarker(img, x+1, y, radius-1);
		drawMarker(img, x, y+1, radius-1);
		drawMarker(img, x-1, y, radius-1);
		drawMarker(img, x, y-1, radius-1);
	}
	return;
}

const drawLine = function(img, x1, x2, y1, y2) {
	//console.log("draw line x1=" + x1 + " y1=" + y1 + " x2=" + x2 + " y2=" + y2);
	var len = Math.round(Math.sqrt(Math.pow(y2-y1,2)+Math.pow(x2-x1,2)));
	for (var i=0; i<=len; i++) {
		var x = x1+Math.round((x2-x1)*i/len);
		var y = y1+Math.round((y2-y1)*i/len);
		colormap(1, img.data, ((img.width * (img.height-1-y) + x) << 2), 'grey');
	}
}

const xTicks = function(img, interval, base, tickL) {
	var tickLpLo = Math.round(tickL*img.height); // tick length. tickL is a percentage of imgH
	var tickLpHi = img.height-tickLpLo;

	for (var i=0; i<Math.ceil(base/interval); i++) {
		var xp = Math.round(i*interval/base*img.width);
		drawLine(img, xp, xp, 0, tickLpLo);
		drawLine(img, xp, xp, tickLpHi, img.height);
		drawLine(img, xp+1, xp+1, 0, tickLpLo);
		drawLine(img, xp+1, xp+1, tickLpHi, img.height);
		drawLine(img, xp-1, xp-1, 0, tickLpLo);
		drawLine(img, xp-1, xp-1, tickLpHi, img.height);
	}
}

const newPng = function(pngWidth, pngHeight) {
	var img = new png({width:pngWidth,height:pngHeight});
	img.data = Buffer.alloc(img.width * img.height * 4, 255); // solid white background
	img.width = pngWidth;
	img.height = pngHeight;
	return img;
}

const savePng = function(img, fileName) {
	img.pack().pipe(fs.createWriteStream(fileName));
}

exports.newPng = newPng;
exports.savePng = savePng;
exports.drawLine = drawLine;
exports.drawMarker = drawMarker;
exports.minmax = minmax;
exports.xTicks = xTicks;
