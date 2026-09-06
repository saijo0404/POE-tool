export type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface DiagnosticBundle {
  app_version: string;
  os: string;
  timestamp: string;
  log_file_path: string;
  log_file_size_bytes: number;
  total_lines: number;
  recent_logs: string;
}
