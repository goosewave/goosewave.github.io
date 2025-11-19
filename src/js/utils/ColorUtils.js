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
    return 3 * Math.pow(delta, 2) * (t - 4 / 29);
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
  const rLin = 3.2406 * x - 1.5372 * y - 0.4986 * z;
  const gLin = -0.9689 * x + 1.8758 * y + 0.0415 * z;
  const bLin = 0.0557 * x - 0.2040 * y + 1.0570 * z;

  // Linear -> Gamma-corrected (sRGB)
  const gammaCorrect = (c) => {
    return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
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
 * Maps [0..1] x 3 -> L*, C*, h -> L*, a*, b* -> sRGB
 * Uses Cylindrical LCh model for more realistic skin tones.
 * @param {number} u - Controls Lightness (L) [0..1] -> [20..95]
 * @param {number} v - Controls Chroma (C) [0..1] -> [10..45]
 * @param {number} w - Controls Hue (h) [0..1] -> [35..75] degrees
 * @returns {string} Hex color code (#RRGGBB)
 */
export function getSkinTone(u, v, w) {
  // 1. Map inputs to LCh ranges with dynamic gamut mapping

  // Lightness (u) Curve: Square root curve to bias toward lighter tones
  const u_effective = Math.sqrt(u);

  // Vibrancy (v) Floor: Remap to [0.25, 1.0]
  const v_effective = 0.25 + (v * 0.75);

  // Lightness (L): 25 to 98 using u_effective
  const L = 25 + u_effective * (98 - 25);

  // Chroma (C): Dynamic based on Lightness to prevent neon artifacts on pale skin
  // Tapers saturation for pale skin.
  const max_C = 35 - (u_effective * 15);
  const min_C = 8 - (u_effective * 5);
  const C = min_C + v_effective * (max_C - min_C);

  // Hue (h): 25 (Cool/Pink) to 65 (Warm/Olive) degrees
  const h_degrees = 25 + w * (65 - 25);

  // 2. Convert Polar (L, C, h) to Cartesian (L, a, b)
  // a = C * cos(h)
  // b = C * sin(h)
  const h_radians = h_degrees * (Math.PI / 180);
  const a_val = C * Math.cos(h_radians);
  const b_val = C * Math.sin(h_radians);

  // 3. Convert Lab to sRGB
  const [r, g, b] = labToSrgb(L, a_val, b_val);

  // 4. Convert floats [0..1] to #RRGGBB
  const toHex = (c) => {
    const clamped = Math.max(0, Math.min(1, c));
    const hex = Math.round(clamped * 255).toString(16).padStart(2, '0');
    return hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
