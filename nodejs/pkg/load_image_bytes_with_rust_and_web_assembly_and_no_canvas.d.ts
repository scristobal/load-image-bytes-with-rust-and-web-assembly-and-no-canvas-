/* tslint:disable */
/* eslint-disable */
/**
* @param {string} url
* @returns {Promise<Uint8ClampedArray>}
*/
export function decode_img_from_url(url: string): Promise<Uint8ClampedArray>;
/**
* @param {ArrayBuffer} array_buffer
* @returns {Promise<Uint8ClampedArray>}
*/
export function decode_img_from_arraybuffer(array_buffer: ArrayBuffer): Promise<Uint8ClampedArray>;
/**
* Chroma subsampling format
*/
export enum ChromaSampling {
/**
* Both vertically and horizontally subsampled.
*/
  Cs420 = 0,
/**
* Horizontally subsampled.
*/
  Cs422 = 1,
/**
* Not subsampled.
*/
  Cs444 = 2,
/**
* Monochrome.
*/
  Cs400 = 3,
}
