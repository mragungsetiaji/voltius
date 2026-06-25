use super::get_backend;
use crate::sftp::SftpManager;
use serde::Serialize;
use tauri::State;

#[derive(Serialize)]
pub struct EditorFile {
    pub content: String,
    pub size: u64,
}

#[derive(Serialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum ReadError {
    TooLarge { size: u64, limit: u64 },
    Binary,
    Io { message: String },
}

impl From<String> for ReadError {
    fn from(message: String) -> Self {
        ReadError::Io { message }
    }
}

/// Heuristic: NUL byte, or >30% bytes outside the printable/whitespace set in the sample.
pub fn is_binary(sample: &[u8]) -> bool {
    if sample.is_empty() {
        return false;
    }
    if sample.contains(&0) {
        return true;
    }
    let non_text = sample
        .iter()
        .filter(|&&b| b < 0x09 || (b > 0x0d && b < 0x20))
        .count();
    non_text * 100 / sample.len() > 30
}

pub const SNIFF_BYTES: usize = 8 * 1024;

#[tauri::command]
pub async fn sftp_read_file(
    sftp_state: State<'_, SftpManager>,
    sftp_id: String,
    path: String,
    max_bytes: u64,
) -> Result<EditorFile, ReadError> {
    let backend = get_backend(&sftp_state, &sftp_id).await?;
    let size = backend.file_size(&path).await;
    if size > max_bytes {
        return Err(ReadError::TooLarge {
            size,
            limit: max_bytes,
        });
    }
    let bytes: Vec<u8> = backend.read_file(&path).await?;
    if bytes.len() as u64 > max_bytes {
        return Err(ReadError::TooLarge {
            size: bytes.len() as u64,
            limit: max_bytes,
        });
    }
    let sample = &bytes[..bytes.len().min(SNIFF_BYTES)];
    if is_binary(sample) {
        return Err(ReadError::Binary);
    }
    let size = bytes.len() as u64;
    Ok(EditorFile {
        content: String::from_utf8_lossy(&bytes).into_owned(),
        size,
    })
}

#[tauri::command]
pub async fn sftp_write_file(
    sftp_state: State<'_, SftpManager>,
    sftp_id: String,
    path: String,
    content: String,
) -> Result<(), String> {
    let lock = sftp_state.path_lock(&sftp_id, &path).await;
    let _guard = lock.lock().await;
    get_backend(&sftp_state, &sftp_id)
        .await?
        .write_file(&path, &content)
        .await
}

#[cfg(test)]
mod tests {
    use super::is_binary;

    #[test]
    fn detects_text() {
        assert!(!is_binary(b"hello world\nsecond line\n"));
        assert!(!is_binary("café déjà".as_bytes()));
    }

    #[test]
    fn detects_binary_nul() {
        assert!(is_binary(b"PNG\x00\x00\x01\x02data"));
    }

    #[test]
    fn detects_binary_ratio() {
        let mut v = vec![0x01u8; 100]; // mostly control bytes
        v.extend_from_slice(b"abc");
        assert!(is_binary(&v));
    }
}
