use std::fs;
use std::path::{Path, PathBuf};

pub const MAX_LOG_SIZE_BYTES: u64 = 5 * 1024 * 1024; // 5 MB
pub const DEFAULT_MAX_BACKUPS: usize = 3;

pub fn get_backup_path(base_path: &Path, index: usize) -> PathBuf {
    let file_name = base_path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("poe-tool.log");
    base_path.with_file_name(format!("{}.{}", file_name, index))
}

pub fn should_rotate(base_path: &Path, max_size_bytes: u64) -> bool {
    if let Ok(meta) = fs::metadata(base_path) {
        meta.len() >= max_size_bytes
    } else {
        false
    }
}

pub fn rotate_logs(base_path: &Path, max_backups: usize) -> Result<(), std::io::Error> {
    if !base_path.exists() {
        return Ok(());
    }

    if max_backups == 0 {
        return fs::remove_file(base_path);
    }

    let oldest_backup = get_backup_path(base_path, max_backups);
    if oldest_backup.exists() {
        let _ = fs::remove_file(&oldest_backup);
    }

    for i in (1..max_backups).rev() {
        let src = get_backup_path(base_path, i);
        let dst = get_backup_path(base_path, i + 1);
        if src.exists() {
            let _ = fs::rename(&src, &dst);
        }
    }

    let first_backup = get_backup_path(base_path, 1);
    fs::rename(base_path, first_backup)?;
    Ok(())
}

pub fn clear_all_logs(base_path: &Path, max_backups: usize) -> Result<(), std::io::Error> {
    if base_path.exists() {
        let _ = fs::remove_file(base_path);
    }
    for i in 1..=max_backups {
        let backup = get_backup_path(base_path, i);
        if backup.exists() {
            let _ = fs::remove_file(&backup);
        }
    }
    // Also remove legacy .log.old if present
    let legacy = base_path.with_extension("log.old");
    if legacy.exists() {
        let _ = fs::remove_file(&legacy);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    #[test]
    fn test_backup_path_generation() {
        let base = PathBuf::from("/tmp/test-app.log");
        let b1 = get_backup_path(&base, 1);
        let b2 = get_backup_path(&base, 2);
        assert_eq!(b1, PathBuf::from("/tmp/test-app.log.1"));
        assert_eq!(b2, PathBuf::from("/tmp/test-app.log.2"));
    }

    #[test]
    fn test_rotation_lifecycle() {
        let temp_dir = std::env::temp_dir().join("poe_test_rotate");
        let _ = fs::create_dir_all(&temp_dir);
        let log_file = temp_dir.join("test.log");

        // Step 1: Write to log
        {
            let mut f = fs::File::create(&log_file).unwrap();
            writeln!(f, "Log line 1").unwrap();
        }
        assert!(log_file.exists());

        // Step 2: Rotate with max 2 backups
        rotate_logs(&log_file, 2).unwrap();
        assert!(!log_file.exists());
        let b1 = get_backup_path(&log_file, 1);
        assert!(b1.exists());

        // Step 3: Write new log & rotate again
        {
            let mut f = fs::File::create(&log_file).unwrap();
            writeln!(f, "Log line 2").unwrap();
        }
        rotate_logs(&log_file, 2).unwrap();
        let b2 = get_backup_path(&log_file, 2);
        assert!(b1.exists());
        assert!(b2.exists());

        // Step 4: Clear all logs
        clear_all_logs(&log_file, 2).unwrap();
        assert!(!log_file.exists());
        assert!(!b1.exists());
        assert!(!b2.exists());

        let _ = fs::remove_dir_all(&temp_dir);
    }
}
