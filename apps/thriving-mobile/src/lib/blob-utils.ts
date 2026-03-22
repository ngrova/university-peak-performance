// ═══════════════════════════════════════════════════════════
// FILE: blob-utils.ts
// PURPOSE: Utility for converting Blobs and Files to base64
//   strings for sending to server actions (Blobs are not
//   serializable across the RSC boundary).
// CALLED BY: components/CaptureMediaSection.tsx
// DATA FLOW: Client-side blob → FileReader → base64 string →
//   passed to server action as serializable data
// ═══════════════════════════════════════════════════════════

/**
 * Triggered by: CaptureMediaSection when preparing media for AI processing.
 * Steps: uses FileReader to read the blob as a data URL, then
 *   strips the data URL prefix to return just the base64 content.
 * Returns: a Promise resolving to the base64-encoded string.
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
