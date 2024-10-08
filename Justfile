build *args: 
	cd wasm-source && cargo build --target=wasm32-unknown-unknown {{ args }}

pack *args:
	cd wasm-source &&  wasm-bindgen ./target/wasm32-unknown-unknown/release/load_image_bytes_with_rust_and_web_assembly_and_no_canvas.wasm {{ args }}

pack-browser:
	@just pack --out-dir ../browser/pkg --target web

pack-nodejs:
	@just pack --out-dir ../nodejs/pkg --target experimental-nodejs-module
	
run-browser:
	cd browser && live-server

run-nodejs: 
	cd nodejs && node node.js
