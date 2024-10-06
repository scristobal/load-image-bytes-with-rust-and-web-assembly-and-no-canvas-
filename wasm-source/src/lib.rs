extern crate console_error_panic_hook;

mod utils;

use image::{ImageFormat, ImageReader};
use js_sys::{ArrayBuffer, Error, Uint8Array, Uint8ClampedArray};
use std::io::Cursor;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use web_sys::Response;

#[wasm_bindgen]
pub async fn decode_img_from_url(url: String) -> Result<Uint8ClampedArray, JsValue> {
    console_error_panic_hook::set_once();

    let window = web_sys::window().ok_or(Error::new("No Window. Are you in the browser?"))?;

    let response = JsFuture::from(window.fetch_with_str(&url))
        .await?
        .dyn_into::<Response>()?;

    let encoded = JsFuture::from(response.array_buffer()?)
        .await?
        .dyn_into::<ArrayBuffer>()?;

    decode_img_from_arraybuffer(encoded).await
}

#[wasm_bindgen]
pub async fn decode_img_from_arraybuffer(
    array_buffer: ArrayBuffer,
) -> Result<Uint8ClampedArray, JsValue> {
    let data = Uint8Array::new(&array_buffer);

    let cursor_enc = Cursor::new(data.to_vec());

    let img = ImageReader::with_format(cursor_enc, ImageFormat::Png)
        .decode()
        .map_err(|e| Error::new(&format!("Can't decode {e:?}. Is it a valid .png file?")))?;

    let result = unsafe { Uint8ClampedArray::view(img.as_bytes()) };

    Ok(result)
}
