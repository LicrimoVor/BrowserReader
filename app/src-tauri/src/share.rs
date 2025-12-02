// use tauri::{
//     plugin::{Builder, TauriPlugin},
//     Manager, Runtime,
// };

// #[command]
// pub async fn share_text<R: Runtime>(
//     app: AppHandle<R>,
//     text: String,
//     mime_type: Option<String>,
// ) -> Result<(), String> {
//     app.share()
//         .share_text(text, ShareTextOptions { mime_type })
//         .map_err(|e| e.to_string())
// }

// #[command]
// pub async fn share_file<R: Runtime>(
//     app: AppHandle<R>,
//     url: String,
//     mime_type: Option<String>,
//     title: Option<String>,
// ) -> Result<(), String> {
//     app.share()
//         .share_file(url, ShareFileOptions { mime_type, title })
//         .map_err(|e| e.to_string())
// }

// /// Extensions to [`tauri::App`], [`tauri::AppHandle`], [`tauri::WebviewWindow`], [`tauri::Webview`] and [`tauri::Window`] to access the share APIs.
// pub trait ShareExt<R: Runtime> {
//     fn share(&self) -> &ShareKit<R>;
// }

// impl<R: Runtime, T: Manager<R>> crate::ShareExt<R> for T {
//     fn share(&self) -> &ShareKit<R> {
//         self.state::<ShareKit<R>>().inner()
//     }
// }

// /// Initializes the plugin.
// pub fn init<R: Runtime>() -> TauriPlugin<R> {
//     Builder::new("sharekit")
//         .invoke_handler(tauri::generate_handler![share_text, share_file])
//         .setup(|app, api| {
//             #[cfg(mobile)]
//             let share = mobile::init(app, api)?;
//             #[cfg(all(desktop, not(target_os = "macos"), not(target_os = "windows")))]
//             let share = desktop::init(app, api)?;
//             #[cfg(target_os = "macos")]
//             let share = macos::init(app, api)?;
//             #[cfg(target_os = "windows")]
//             let share = windows::init(app, api)?;
//             app.manage(share);
//             Ok(())
//         })
//         .build()
// }
