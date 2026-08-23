pub mod path_resolver;
pub mod writer;

pub use path_resolver::{get_exe_dir, get_primary_log_path, open_or_create_writable_log};
pub use writer::{get_current_log_path, init_logger, log_to_file, read_recent_logs};

#[macro_export]
macro_rules! app_log {
    ($($arg:tt)*) => {{
        let msg = format!($($arg)*);
        println!("{}", msg);
        $crate::services::logger::log_to_file(&msg);
    }};
}
