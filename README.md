# xcorr
Cross correlation of two 16-bit buffers in JS.
Uses Fourier transforms for fast calculation, as explained e.g. at http://mathworld.wolfram.com/Cross-CorrelationTheorem.html

## Usage
See `xcorr.test.js`.

```
const sig = Buffer.from([0, 1, 0, 0]); // two 16-bit samples
Xcorr(sig, sig) === {
	xcorr: [1, 0], // raw cross-correlation profile
	xcorrMax: 1,   // max cross-correlation
	iMax: 0,       // index in first buffer at which cross-correlation is maxed
}
```

More about the sign of `ìMax`:
```
// two arrays of four 16-bit samples, rotated by one sample
const sig1 = Buffer.from([0, 1, 0, 0, 0, 4, 0, 2]);
const sig2 = Buffer.from([0, 2, 0, 1, 0, 0, 0, 4]);
Xcorr(sig1, sig2).iMax === -1
Xcorr(sig2, sig1).iMax === 1
```

If the input signals do not have a length equal to a power of 2 (2, 4, 8, 16…), they are padded with zeroes.