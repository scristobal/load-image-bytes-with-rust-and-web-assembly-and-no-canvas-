# Load ImageData with Rust and Web Assembly (no canvas involved)

A quick experiment and benchmark to try get the raw RGBA pixels of a PNG using:

1. compiling Rust into `wasm-bindgen`  
1. with WebGL2 API
1. using `OffscreenCanvas`
1. a cairo backend on node, npm- `canvas`
1. pure JS implementation, npm- `pngjs`


