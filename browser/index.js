import init, { decode_img_from_arraybuffer, decode_img_from_url } from './pkg/load_image_bytes_with_rust_and_web_assembly_and_no_canvas.js'

const urls = ['/images/tiny.png', '/images/small.png', '/images/medium.png', '/images/large.png',];

const functions = [getImageDataUsingWebAssembly, getImageDataUsingWebgl, getImageDataUsingOfflineCanvas];

async function bench(fn, url) {
	let start = performance.now();

	let res = await fn(url, start)

	console.log(fn.name, url, performance.now() - start)
}


async function run(functions, urls) {
	for (const _function of functions) {
		console.log("--", _function.name)
		for (const url of urls) {
			await bench(_function, url)
		}
	}
}

run(functions, urls);


async function getImageDataUsingWebAssembly(url, start) {
	const wasm = await init({});

	const response = await fetch(url);

	const blob = await response.blob();

	const bitmap = await createImageBitmap(blob, { colorSpaceConversion: 'none' });

	const arrayBuffer = await blob.arrayBuffer();

	const data = await decode_img_from_arraybuffer(arrayBuffer);

	return new ImageData(data, bitmap.width, bitmap.height);
}

async function getImageDataUsingOfflineCanvas(url, start) {

	const response = await fetch(url);

	const blob = await response.blob();

	const bitmap = await createImageBitmap(blob, { colorSpaceConversion: 'none' });
	const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);

	const ctx = canvas.getContext('2d');

	ctx?.drawImage(bitmap, 0, 0);

	// bitmaps do not get GC'd
	bitmap.close();

	const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);

	return imageData
}


async function getImageDataUsingWebgl(url, start) {

	const response = await fetch(url);

	const blob = await response.blob();

	const bitmap = await createImageBitmap(blob, { colorSpaceConversion: 'none' });

	const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);

	const gl = canvas.getContext('webgl2');

	const fb = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

	const texture = gl.createTexture();

	// gl.activeTexture(gl.TEXTURE0);

	gl.bindTexture(gl.TEXTURE_2D, texture);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, bitmap.width, bitmap.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);

	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

	const data = new Uint8ClampedArray(bitmap.width * bitmap.height * 4);

	gl.readPixels(0, 0, bitmap.width, bitmap.height, gl.RGBA, gl.UNSIGNED_BYTE, data);

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	return new ImageData(data, bitmap.width, bitmap.height);
}

