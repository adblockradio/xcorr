const { Xcorr } = require('./xcorr.js');
const assert = require('assert').strict;

describe('Xcorr', () => {
	it('should return 1 when given identical signals', () => {
		const sig = Buffer.from([0, 1, 0, 0]);
		assert.deepEqual(Xcorr(sig, sig), {
			xcorr: new Float64Array([0.9999999999999999, 0]), // duh...
			xcorrMax: 0.9999999999999999, // duh...
			iMax: 0,
		});
	});

	it('should return the index of the max of the cross-correlation', () => {
		const sig1 = Buffer.from([0, 1, 0, 0, 0, 4, 0, 2]);
		const sig2 = Buffer.from([0, 2, 0, 1, 0, 0, 0, 4]);
		assert.deepEqual(Xcorr(sig1, sig2).iMax, -1);
		assert.deepEqual(Xcorr(sig2, sig1).iMax, 1);
	});

	it('should support correlated but differently scaled signals', () => {
		const sig1 = Buffer.from([0, 6, 0, 0, 0, 4, 0, 2]);
		const sig2 = Buffer.from([0, 1, 0, 3, 0, 0, 0, 2]); // half the values of sig1
		assert.deepEqual(Xcorr(sig1, sig2).xcorr[3], 1);
	});

	it('should support signals of arbitrary length', () => {
		const sig1 = Buffer.from([0, 6, 0, 0, 0, 4, 0, 2, 0, 16, 0, 2]);
		const sig2 = Buffer.from([0, 1, 0, 3, 0, 0, 0, 2, 0, 1, 0, 8]); // half the values of sig1
		assert.deepEqual(Xcorr(sig1, sig2).iMax, -1);
		assert.deepEqual(Xcorr(sig2, sig1).iMax, 1);
	});
});
