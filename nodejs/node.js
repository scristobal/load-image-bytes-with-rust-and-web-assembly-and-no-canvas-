import { createCanvas, loadImage } from "canvas";

import { decode_img_from_arraybuffer } from './pkg/load_image_bytes_with_rust_and_web_assembly_and_no_canvas.js'


const urls = ['/images/tiny.png', '/images/small.png', '/images/medium.png', '/images/large.png',];

const functions = [getImageDataUsingWebAssembly, getImageDataUsingNode];

async function bench(fn, url) {
	let start = performance.now();

	let res = await fn('http://localhost:8080' + url, start)

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
	//	const wasm = await init({});

	const response = await fetch(url);

	const blob = await response.blob();

	// const bitmap = await createImageBitmap(blob, { colorSpaceConversion: 'none' });

	const arrayBuffer = await blob.arrayBuffer();

	const data = await decode_img_from_arraybuffer(arrayBuffer);

	return data
}


async function getImageDataUsingNode(url) {
	const img = await loadImage(url);

	const canvas = createCanvas(img.width, img.height);

	const ctx = canvas.getContext('2d');

	ctx?.drawImage(img, 0, 0);

	const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);

	return imageData.data
}



