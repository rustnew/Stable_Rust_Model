pub mod app;
pub mod pages;

#[wasm_bindgen::prelude::wasm_bindgen(start)]
pub fn main_js() {
    console_error_panic_hook::set_once();
    console_log::init_with_level(log::Level::Info).ok();
    yew::Renderer::<app::App>::new().render();
}
