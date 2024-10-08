import { createCanvas, loadImage } from "canvas";
import fs from 'fs'
import { decode_img_from_arraybuffer } from './pkg/load_image_bytes_with_rust_and_web_assembly_and_no_canvas.js'
import { PNG } from 'pngjs'

const NUM_IMAGES = 9;

const functions = [getImageDataUsingWebAssembly, getImageDataUsingNode, getImageDataUsingPngjs];

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
			const fileName = `./images/${i}.png`;
			totalTime += await bench(_function, fileName)
		}


		console.log(`Total time for ${_function.name} is ${totalTime}`)
	}
}

run(functions, NUM_IMAGES);

async function getImageDataUsingWebAssembly(fileName) {


	const arrayBuffer = fs.readFileSync(fileName, { encoding: null });
	const data = await decode_img_from_arraybuffer(arrayBuffer.buffer);

	return data
}


async function getImageDataUsingNode(fileName) {
	const img = await loadImage(fileName);

	const canvas = createCanvas(img.width, img.height);

	const ctx = canvas.getContext('2d');

	ctx?.drawImage(img, 0, 0);

	const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);

	return imageData.data
}

async function getImageDataUsingPngjs(fileName) {
	const data = fs.readFileSync(fileName);

	const png = PNG.sync.read(data);

	return png.data
}

