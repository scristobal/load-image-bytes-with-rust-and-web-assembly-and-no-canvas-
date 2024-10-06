
import { __wbg_set_wasm } from "./load_image_bytes_with_rust_and_web_assembly_and_no_canvas_bg.js";

let imports = {};
import * as import0 from './load_image_bytes_with_rust_and_web_assembly_and_no_canvas_bg.js';
imports['./load_image_bytes_with_rust_and_web_assembly_and_no_canvas_bg.js'] = import0;

import * as path from 'node:path';
import * as fs from 'node:fs';
import * as process from 'node:process';

let file = path.dirname(new URL(import.meta.url).pathname);
if (process.platform === 'win32') {
    file = file.substring(1);
}
const bytes = fs.readFileSync(path.join(file, 'load_image_bytes_with_rust_and_web_assembly_and_no_canvas_bg.wasm'));

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
const wasm = wasmInstance.exports;
export const __wasm = wasm;


__wbg_set_wasm(wasm);
export * from "./load_image_bytes_with_rust_and_web_assembly_and_no_canvas_bg.js";