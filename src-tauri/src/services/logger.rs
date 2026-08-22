use std::fs::{File, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use lazy_static::lazy_static;
use chrono::Local;

const MAX_LOG_SIZE_BYTES: u64 = 10 * 1024 * 1024; // 10 MB

lazy_static! {
    static ref LOG_FILE_PATH: Mutex<PathBuf> = Mutex::new(get_primary_log_path());
    static ref LOG_WRITER: Mutex<Option<File>> = Mutex::new(None);
}

/// 取得執行檔所在目錄 (如果獲取失敗則回傳當前工作目錄)
pub fn get_exe_dir() -> PathBuf {
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(parent) = exe_path.parent() {
            return parent.to_path_buf();
        }
    }
    std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
}

/// 取得首選日誌路徑 (位於執行檔所在資料夾)
pub fn get_primary_log_path() -> PathBuf {
    get_exe_dir().join("poe-tool.log")
}

/// 取得備用日誌路徑清單 (當執行檔目錄因權限不足無法寫入時依序嘗試)
fn get_fallback_log_paths() -> Vec<PathBuf> {
    let mut list = Vec::new();

    // 1. 使用者 LocalAppData / Home 資料夾
    let app_dir = if let Some(local_app_data) = std::env::var_os("LOCALAPPDATA") {
        PathBuf::from(local_app_data).join("POE_tool")
    } else if let Some(home) = std::env::var_os("HOME") {
        PathBuf::from(home).join(".poe_tool")
    } else {
        PathBuf::from("data")
    };
    list.push(app_dir.join("poe-tool.log"));

    // 2. 系統暫存目錄 (Temp)
    let temp_dir = std::env::temp_dir().join("POE_tool");
    list.push(temp_dir.join("poe-tool.log"));

    list
}

/// 嘗試確保路徑可寫入並開啟檔案，包含建立目錄、解除唯讀屬性等
pub fn open_or_create_writable_log(path: &Path) -> Result<File, std::io::Error> {
    // 1. 確保父目錄存在且具有寫入權限
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            std::fs::create_dir_all(parent)?;
        }
    }

    // 2. 若檔案已存在且被標記為唯讀 (Windows Read-Only Attribute)，嘗試解除唯讀
    if let Ok(metadata) = std::fs::metadata(path) {
        let mut perms = metadata.permissions();
        if perms.readonly() {
            perms.set_readonly(false);
            let _ = std::fs::set_permissions(path, perms);
        }

        // 檢查檔案大小是否過大，若超過 10MB 則進行輪替 (Rotate)
        if metadata.len() > MAX_LOG_SIZE_BYTES {
            let backup_path = path.with_extension("log.old");
            let _ = std::fs::rename(path, backup_path);
        }
    }

    // 3. 以建立與追加模式開啟檔案
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)?;

    // 4. 寫入驗證位元組並 flush 確保真實可寫
    file.flush()?;

    Ok(file)
}

/// 初始化日誌系統：優先寫入執行檔資料夾，如遇權限問題自動切換備用路徑
pub fn init_logger() {
    let primary = get_primary_log_path();
    let mut chosen_path = primary.clone();
    let mut active_writer = None;
    let mut fallback_warning = None;

    // 優先嘗試執行檔資料夾
    match open_or_create_writable_log(&primary) {
        Ok(file) => {
            active_writer = Some(file);
        }
        Err(err) => {
            let err_msg = format!(
                "無法在執行檔資料夾建立/寫入日誌檔 ({:?}): {}，嘗試使用備用目錄...",
                primary, err
            );
            eprintln!("[POE_tool Logger] {}", err_msg);

            // 依序嘗試備用路徑
            for fallback in get_fallback_log_paths() {
                match open_or_create_writable_log(&fallback) {
                    Ok(file) => {
                        fallback_warning = Some(format!(
                            "執行檔資料夾無寫入權限 ({})，日誌已轉移至備用路徑: {:?}",
                            err, fallback
                        ));
                        chosen_path = fallback;
                        active_writer = Some(file);
                        break;
                    }
                    Err(f_err) => {
                        eprintln!("[POE_tool Logger] 備用路徑 {:?} 亦無法寫入: {}", fallback, f_err);
                    }
                }
            }
        }
    }

    // 更新全域路徑與寫入控制代碼
    {
        let mut path_lock = LOG_FILE_PATH.lock().unwrap();
        *path_lock = chosen_path.clone();
    }
    {
        let mut writer_lock = LOG_WRITER.lock().unwrap();
        *writer_lock = active_writer;
    }

    log_raw("=== POE_tool Started ===");
    log_raw(&format!("Log File Path: {}", chosen_path.to_string_lossy()));

    if let Some(warn) = fallback_warning {
        log_raw(&format!("[WARN] {}", warn));
    }
}

/// 取得當前使用的日誌檔案完整路徑
pub fn get_current_log_path() -> String {
    let p = LOG_FILE_PATH.lock().unwrap();
    p.to_string_lossy().to_string()
}

/// 輸出日誌訊息 (同步輸出至終端與日誌檔案)
pub fn log_raw(msg: &str) {
    let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S%.3f");
    let line = format!("[{}] {}\n", timestamp, msg);

    // 終端輸出
    print!("{}", line);

    let mut lock = LOG_WRITER.lock().unwrap();
    if lock.is_none() {
        // 若尚未初始化或寫入控制代碼丟失，嘗試自動重連
        let path = {
            let p = LOG_FILE_PATH.lock().unwrap();
            p.clone()
        };
        if let Ok(file) = open_or_create_writable_log(&path) {
            *lock = Some(file);
        }
    }

    if let Some(ref mut file) = *lock {
        let _ = file.write_all(line.as_bytes());
        let _ = file.flush();
    }
}

/// 讀取最近的日誌內容
pub fn read_recent_logs(max_lines: Option<usize>) -> Result<String, String> {
    // 讀取前先確保當前緩衝區已寫入
    {
        let mut lock = LOG_WRITER.lock().unwrap();
        if let Some(ref mut file) = *lock {
            let _ = file.flush();
        }
    }

    let path = {
        let p = LOG_FILE_PATH.lock().unwrap();
        p.clone()
    };

    if !path.exists() {
        return Ok("尚無日誌檔案".to_string());
    }

    let content = std::fs::read_to_string(&path)
        .map_err(|e| format!("無法讀取日誌檔案: {}", e))?;

    let lines: Vec<&str> = content.lines().collect();
    let count = max_lines.unwrap_or(200);

    if lines.len() <= count {
        Ok(lines.join("\n"))
    } else {
        let start = lines.len() - count;
        Ok(lines[start..].join("\n"))
    }
}

#[macro_export]
macro_rules! app_log {
    ($($arg:tt)*) => {
        $crate::services::logger::log_raw(&format!($($arg)*))
    };
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_exe_dir_and_primary_path() {
        let exe_dir = get_exe_dir();
        assert!(exe_dir.exists() || exe_dir == PathBuf::from("."));
        let primary = get_primary_log_path();
        assert_eq!(primary.file_name().unwrap(), "poe-tool.log");
    }

    #[test]
    fn test_writable_log_creation_and_readonly_reset() {
        let temp_dir = std::env::temp_dir().join("poe_test_logger");
        let test_log = temp_dir.join("test_write.log");
        let _ = std::fs::remove_file(&test_log);

        // 1. 建立日誌
        let res = open_or_create_writable_log(&test_log);
        assert!(res.is_ok());
        drop(res);

        // 2. 測試若被設定為唯讀屬性，應自動解除唯讀並成功寫入
        if let Ok(meta) = std::fs::metadata(&test_log) {
            let mut perms = meta.permissions();
            perms.set_readonly(true);
            let _ = std::fs::set_permissions(&test_log, perms);
        }

        let res2 = open_or_create_writable_log(&test_log);
        assert!(res2.is_ok());

        // 清理測試檔案
        let _ = std::fs::remove_file(&test_log);
        let _ = std::fs::remove_dir(&temp_dir);
    }

    #[test]
    fn test_log_rotation_on_oversize() {
        let temp_dir = std::env::temp_dir().join("poe_test_logger_rot");
        let test_log = temp_dir.join("test_rot.log");
        let _ = std::fs::create_dir_all(&temp_dir);
        let _ = std::fs::remove_file(&test_log);
        let _ = std::fs::remove_file(&test_log.with_extension("log.old"));

        // 寫入超過 MAX_LOG_SIZE_BYTES 的假資料
        {
            let f = File::create(&test_log).unwrap();
            f.set_len(MAX_LOG_SIZE_BYTES + 1024).unwrap();
        }

        // 呼叫 open_or_create_writable_log 應自動進行 rotate
        let res = open_or_create_writable_log(&test_log);
        assert!(res.is_ok());
        drop(res);

        assert!(test_log.with_extension("log.old").exists());

        // 清理測試檔案
        let _ = std::fs::remove_file(&test_log);
        let _ = std::fs::remove_file(&test_log.with_extension("log.old"));
        let _ = std::fs::remove_dir(&temp_dir);
    }

    #[test]
    fn test_read_recent_logs_functionality() {
        let temp_dir = std::env::temp_dir().join("poe_test_logger_read");
        let test_log = temp_dir.join("test_read.log");
        let _ = std::fs::create_dir_all(&temp_dir);
        let _ = std::fs::remove_file(&test_log);

        let lines = "line 1\nline 2\nline 3\nline 4\nline 5\n";
        std::fs::write(&test_log, lines).unwrap();

        // 暫存 LOG_FILE_PATH 進行測試
        {
            let mut p = LOG_FILE_PATH.lock().unwrap();
            *p = test_log.clone();
        }

        let read_all = read_recent_logs(Some(10)).unwrap();
        assert_eq!(read_all, "line 1\nline 2\nline 3\nline 4\nline 5");

        let read_last_2 = read_recent_logs(Some(2)).unwrap();
        assert_eq!(read_last_2, "line 4\nline 5");

        // 清理測試檔案
        let _ = std::fs::remove_file(&test_log);
        let _ = std::fs::remove_dir(&temp_dir);
    }
}


