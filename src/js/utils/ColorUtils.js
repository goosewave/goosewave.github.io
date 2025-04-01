/**
 * Color conversion utilities for skin tone generation
 * Ported from Python implementation
 */

/**
 * Converts CIE Lab to XYZ (D65)
 * @param {number} L - Lightness
 * @param {number} a - Green-Red component
 * @param {number} b - Blue-Yellow component
 * @returns {Array} [x, y, z] coordinates in XYZ color space
 */
export function labToXyz(L, a, b) {
  // Scale L*, a*, b*
  const y = (L + 16) / 116;
  const x = a / 500 + y;
  const z = y - b / 200;

  // Helper function
  const fInv = (t) => {
    const delta = 6 / 29;
    if (t > delta) {
      return Math.pow(t, 3);
    }
    return 3 * Math.pow(delta, 2) * (t - 4/29);
  };

  // D65 reference white
  const xVal = 0.95047 * fInv(x);
  const yVal = 1.00000 * fInv(y);
  const zVal = 1.08883 * fInv(z);
  
  return [xVal, yVal, zVal];
}

/**
 * Converts XYZ to gamma-corrected sRGB in [0..1]
 * @param {number} x - X component
 * @param {number} y - Y component
 * @param {number} z - Z component
 * @returns {Array} [r, g, b] values in sRGB color space (0-1 range)
 */
export function xyzToSrgb(x, y, z) {
  // XYZ -> Linear RGB
  const rLin =  3.2406 * x - 1.5372 * y - 0.4986 * z;
  const gLin = -0.9689 * x + 1.8758 * y + 0.0415 * z;
  const bLin =  0.0557 * x - 0.2040 * y + 1.0570 * z;

  // Linear -> Gamma-corrected (sRGB)
  const gammaCorrect = (c) => {
    return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1/2.4) - 0.055;
  };

  const r = gammaCorrect(rLin);
  const g = gammaCorrect(gLin);
  const b = gammaCorrect(bLin);

  // Clamp to [0..1]
  return [
    Math.max(0, Math.min(1, r)),
    Math.max(0, Math.min(1, g)),
    Math.max(0, Math.min(1, b))
  ];
}

/**
 * Converts Lab color to sRGB
 * @param {number} L - Lightness
 * @param {number} a - Green-Red component
 * @param {number} b - Blue-Yellow component
 * @returns {Array} [r, g, b] values in sRGB color space (0-1 range)
 */
export function labToSrgb(L, a, b) {
  const [x, y, z] = labToXyz(L, a, b);
  return xyzToSrgb(x, y, z);
}

/**
 * Maps [0..1] x 3 -> L*, a*, b* using an expanded region
 * to capture both light and very dark skin tones.
 * @param {number} u - Controls lightness (0-1)
 * @param {number} v - Controls green-red undertone (0-1)
 * @param {number} w - Controls blue-yellow undertone (0-1)
 * @returns {string} Hex color code (#RRGGBB)
 */
export function getSkinTone(u, v, w) {
  // Expanded bounding region for a broader set of undertones:
  //   L in [10..90]  (darker to lighter)
  //   a in [0..30]   (greenish to reddish)
  //   b in [10..40]  (bluish to yellowish)
  const L_min = 10, L_max = 90;
  const a_min = 0, a_max = 30;
  const b_min = 10, b_max = 40;

  const L = L_min + u * (L_max - L_min);
  const A = a_min + v * (a_max - a_min);
  const B = b_min + w * (b_max - b_min);

  const [r, g, b] = labToSrgb(L, A, B);
  
  // Convert floats [0..1] to #RRGGBB
  const toHex = (c) => {
    const hex = Math.round(c * 255).toString(16).padStart(2, '0');
    return hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
