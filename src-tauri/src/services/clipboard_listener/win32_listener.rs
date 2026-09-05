#![cfg(target_os = "windows")]

use super::{handle_clipboard_change, APP_HANDLE};
use std::ptr::null_mut;
use windows::core::PCWSTR;
use windows::Win32::Foundation::{HINSTANCE, HWND, LPARAM, LRESULT, WPARAM};
use windows::Win32::Graphics::Gdi::HBRUSH;
use windows::Win32::System::DataExchange::{
    AddClipboardFormatListener, RemoveClipboardFormatListener,
};
use windows::Win32::UI::WindowsAndMessaging::{
    CreateWindowExW, DefWindowProcW, DestroyWindow, DispatchMessageW, GetMessageW,
    RegisterClassExW, TranslateMessage, HCURSOR, HICON, HWND_MESSAGE, MSG, WINDOW_EX_STYLE,
    WINDOW_STYLE, WM_CLIPBOARDUPDATE, WNDCLASSEXW, WNDCLASS_STYLES,
};

pub fn run_win32_listener() {
    unsafe extern "system" fn wndproc(
        hwnd: HWND,
        msg: u32,
        wparam: WPARAM,
        lparam: LPARAM,
    ) -> LRESULT {
        if msg == WM_CLIPBOARDUPDATE {
            if let Some(app) = APP_HANDLE.get() {
                handle_clipboard_change(app);
            }
            return LRESULT(0);
        }
        DefWindowProcW(hwnd, msg, wparam, lparam)
    }

    unsafe {
        let class_name: Vec<u16> = "PoeToolClipboardListener\0".encode_utf16().collect();
        let wnd_class = WNDCLASSEXW {
            cbSize: std::mem::size_of::<WNDCLASSEXW>() as u32,
            style: WNDCLASS_STYLES(0),
            lpfnWndProc: Some(wndproc),
            cbClsExtra: 0,
            cbExtra: 0,
            hInstance: HINSTANCE(null_mut()),
            hIcon: HICON(null_mut()),
            hCursor: HCURSOR(null_mut()),
            hbrBackground: HBRUSH(null_mut()),
            lpszMenuName: PCWSTR::null(),
            lpszClassName: PCWSTR(class_name.as_ptr()),
            hIconSm: HICON(null_mut()),
        };

        if RegisterClassExW(&wnd_class) == 0 {
            crate::app_log!("[ClipboardListener] ❌ Failed to register window class");
            return;
        }

        let hwnd = CreateWindowExW(
            WINDOW_EX_STYLE(0),
            PCWSTR(class_name.as_ptr()),
            PCWSTR::null(),
            WINDOW_STYLE(0),
            0,
            0,
            0,
            0,
            HWND_MESSAGE,
            None,
            HINSTANCE(null_mut()),
            None,
        );

        let hwnd = match hwnd {
            Ok(h) if !h.0.is_null() => h,
            _ => {
                crate::app_log!("[ClipboardListener] ❌ Failed to create message-only window");
                return;
            }
        };

        if let Err(e) = AddClipboardFormatListener(hwnd) {
            crate::app_log!(
                "[ClipboardListener] ❌ AddClipboardFormatListener failed: {}",
                e
            );
            let _ = DestroyWindow(hwnd);
            return;
        }

        crate::app_log!(
            "[ClipboardListener] 🚀 Win32 AddClipboardFormatListener active (0ms push mode)"
        );

        let mut msg = MSG::default();
        while GetMessageW(&mut msg, HWND(null_mut()), 0, 0).as_bool() {
            let _ = TranslateMessage(&msg);
            DispatchMessageW(&msg);
        }

        let _ = RemoveClipboardFormatListener(hwnd);
        let _ = DestroyWindow(hwnd);
    }
}
