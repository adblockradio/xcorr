const dsp = require('dsp.js');

/**
 * Cross-correlation of two signals of identical length (ring correlation with FFT)
 * @param {Buffer} sig1 16-bit PCM buffer
 * @param {Buffer} sig2 16-bit PCM buffer
 */

const DEBUG_PLOT = false; // plot the result for debug purposes

exports.Xcorr = function (sig1, sig2) {
	if (sig1.length !== sig2.length) {
		throw new Error(`Xcorr: signal have different lengths ${sig1.length} vs ${sig2.length}`);
	}

	if (sig1.length % 2 !== 0 || sig1.length === 0) {
		throw new Error('Xcorr: signals do no seem to be 16-bit PCM.');
	}

	// detect if the signal has not a length equal to a power of 2 (2, 4, 8, 16…), then pad the signals with zeroes.
	// to not mess with the results of ring correlation, it pads with zeros to reach a length equal the second next power of 2.
	const pow2 = Math.log(sig1.length) / Math.log(2);
	if (Math.ceil(pow2) !== pow2) {
		const paddingAmount = Math.round(Math.pow(2, Math.ceil(pow2) + 1) - Math.pow(2, pow2));
		const paddingBuffer = Buffer.alloc(paddingAmount, 0);
		sig1 = Buffer.concat([sig1, paddingBuffer]);
		sig2 = Buffer.concat([sig2, paddingBuffer]);
	}

	// samples in each signal
	const l = sig1.length / 2;

	// convert Buffer to arrays.
	const sig1arr = new Array(l).fill(0).map((_, i) => sig1.readInt16LE(2*i));
	const sig2arr = new Array(l).fill(0).map((_, i) => sig2.readInt16LE(2*i));

	// compute RMS
	const rms1 = Math.sqrt(sig1arr.reduce((rms, sample) => rms + Math.pow(sample, 2), 0) / l);
	const rms2 = Math.sqrt(sig2arr.reduce((rms, sample) => rms + Math.pow(sample, 2), 0) / l);

	// arbitrary sampling rate
	const SAMPLING_RATE = 1;

	const fft1 = new dsp.FFT(l, SAMPLING_RATE)
	fft1.forward(sig1arr);

	const fft2 = new dsp.FFT(l, SAMPLING_RATE);
	fft2.forward(sig2arr);

	const realp = new Array(l).fill(0).map((_, i) => fft1.real[i] * fft2.real[i] + fft1.imag[i] * fft2.imag[i]);
	const imagp = new Array(l).fill(0).map((_, i) => -fft1.real[i] * fft2.imag[i] + fft2.real[i] * fft1.imag[i]);
	// note we have taken the complex conjugate of fft2.

	const fftp = new dsp.FFT(l, SAMPLING_RATE);
	const xcorr = fftp.inverse(realp, imagp).map(coef => coef / rms1 / rms2 / l); // normalize the module of xcorr to [0, 1]

	// index of the max amplitude of xcorr
	const iMax = xcorr.reduce((indexTemporaryMax, testCoef, indexTestCoef) =>
		Math.abs(testCoef) > Math.abs(xcorr[indexTemporaryMax]) ? indexTestCoef : indexTemporaryMax, 0);

	if (DEBUG_PLOT) _plot(xcorr);

	return {
		xcorr,
		xcorrMax: xcorr[iMax],
		iMax: iMax < l / 2 ? iMax : iMax - l, // have iMax relative to index 0
	};
}

const _plot = function(xcorr) {
	const plot = require("./plot.js");
	const l = xcorr.length;
	const imgW = 800, imgH = 600;
	const img = plot.newPng(imgW,imgH);

	for (let x = 0; x < imgW; x++) {
		const value = xcorr[Math.floor(x * l / imgW)];
		plot.drawMarker(img, x, Math.round(imgH * value), 2);
	}
	plot.savePng(img, "xcorr.png");
}