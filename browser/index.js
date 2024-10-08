import init, { decode_img_from_arraybuffer, decode_img_from_url } from './pkg/load_image_bytes_with_rust_and_web_assembly_and_no_canvas.js'

const NUM_IMAGES = 9;

const functions = [getImageDataUsingWebAssembly, getImageDataUsingWebgl, getImageDataUsingOfflineCanvas, decode_img_from_url];

async function bench(fn, url) {
	let start = performance.now();

	let res = await fn(url, start)

	const timeTaken = performance.now() - start;

	console.log(`  ${fn.name} ${url} ${timeTaken}`)

	return timeTaken
}


async function run(functions, num_images) {


	for (const _function of functions) {
		console.log(`Benchmarking ${_function.name}`);

		let totalTime = 0;

		for (let i = 1; i <= num_images; i++) {
			const url = `/images/${i}.png`
			totalTime += await bench(_function, url)
		}


		console.log(`Total time for ${_function.name} is ${totalTime}`)
	}
}

run(functions, NUM_IMAGES);




async function getImageDataUsingWebAssembly(url) {
	const wasm = await init({});

	const response = await fetch(url);

	const blob = await response.blob();

	const bitmap = await createImageBitmap(blob, { colorSpaceConversion: 'none' });

	const arrayBuffer = await blob.arrayBuffer();

	const data = await decode_img_from_arraybuffer(arrayBuffer);

	return data
}

async function getImageDataUsingOfflineCanvas(url) {

	const response = await fetch(url);

	const blob = await response.blob();

	const bitmap = await createImageBitmap(blob, { colorSpaceConversion: 'none' });
	const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);

	const ctx = canvas.getContext('2d');

	ctx?.drawImage(bitmap, 0, 0);

	// bitmaps do not get GC'd
	bitmap.close();

	const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);

	return imageData.data
}


async function getImageDataUsingWebgl(url) {

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

	return data
}

