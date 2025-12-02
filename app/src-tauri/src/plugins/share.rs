use jni::objects::{JObject, JString};
use jni::JNIEnv;
use tauri::plugin::Plugin;

#[tauri::plugin]
mod share {
    #[command]
    pub fn android_share_text(env: JNIEnv, activity: JObject, text: String) {
        let intent = env
            .new_object("android/content/Intent", "()V", &[])
            .unwrap();

        env.call_method(
            intent,
            "setAction",
            "(Ljava/lang/String;)Landroid/content/Intent;",
            &[env
                .new_string("android.intent.action.ACTION_SEND")
                .unwrap()
                .into()],
        )
        .unwrap();

        env.call_method(
            intent,
            "putExtra",
            "(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;",
            &[
                env.new_string("android.intent.extra.TEXT").unwrap().into(),
                env.new_string(text).unwrap().into(),
            ],
        )
        .unwrap();

        env.call_method(
            intent,
            "setType",
            "(Ljava/lang/String;)Landroid/content/Intent;",
            &[env.new_string("text/plain").unwrap().into()],
        )
        .unwrap();

        env.call_method(
            activity,
            "startActivity",
            "(Landroid/content/Intent;)V",
            &[intent.into()],
        )
        .unwrap();
    }
}
