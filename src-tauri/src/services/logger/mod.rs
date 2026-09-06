pub mod path_resolver;
pub mod rotator;
pub mod sanitizer;
pub mod types;
pub mod writer;

pub use path_resolver::{get_exe_dir, get_fallback_log_paths, get_primary_log_path, open_or_create_writable_log};
pub use rotator::{clear_all_logs, rotate_logs, should_rotate, DEFAULT_MAX_BACKUPS, MAX_LOG_SIZE_BYTES};
pub use sanitizer::sanitize_log_message;
pub use types::{DiagnosticBundle, LogLevel};
pub use writer::{clear_logs, get_current_log_path, get_diagnostic_bundle, init_logger, log_entry, log_to_file, read_recent_logs};

#[macro_export]
macro_rules! app_log {
    ($($arg:tt)*) => {{
        let msg = format!($($arg)*);
        println!("{}", msg);
        $crate::services::logger::log_entry($crate::services::logger::LogLevel::Info, Some("Backend"), &msg);
    }};
}

#[macro_export]
macro_rules! app_log_level {
    ($level:expr, $ctx:expr, $($arg:tt)*) => {{
        let msg = format!($($arg)*);
        println!("[{}] {}", $level, msg);
        $crate::services::logger::log_entry($level, Some($ctx), &msg);
    }};
}
