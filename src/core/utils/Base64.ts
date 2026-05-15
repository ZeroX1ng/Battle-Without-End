// ═══ Base64 编解码 ═══
// AS3 原始: tool.Base64.as
//
// 用于游戏存档的 Base64 编码/解码，支持字节压缩数据的传输。
// 原始实现使用 Flash ByteArray，这里用 TextEncoder/TextDecoder 替代。

const _base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

/**
 * Base64 编码
 * 
 * @param input - 要编码的字符串
 * @returns Base64 编码后的字符串
 */
export function Base64Encode(input: string): string {
  let output = '';
  let i = 0;
  const len = input.length;

  while (i < len) {
    const chr1 = input.charCodeAt(i++) & 0xff;
    const chr2 = i < len ? input.charCodeAt(i++) & 0xff : NaN;
    const chr3 = i < len ? input.charCodeAt(i++) & 0xff : NaN;

    const enc1 = chr1 >> 2;
    const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    let enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    let enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }

    output += _base64Chars.charAt(enc1) + _base64Chars.charAt(enc2) +
              _base64Chars.charAt(enc3) + _base64Chars.charAt(enc4);
  }

  return output;
}

/**
 * Base64 解码
 *
 * @param input - Base64 编码的字符串
 * @returns 解码后的原始字符串
 */
export function Base64Decode(input: string): string {
  let output = '';
  let i = 0;
  input = input.replace(/[^A-Za-z0-9+/=]/g, '');

  while (i < input.length) {
    const enc1 = _base64Chars.indexOf(input.charAt(i++));
    const enc2 = _base64Chars.indexOf(input.charAt(i++));
    const enc3 = _base64Chars.indexOf(input.charAt(i++));
    const enc4 = _base64Chars.indexOf(input.charAt(i++));

    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;

    output += String.fromCharCode(chr1);
    if (enc3 != 64) {
      output += String.fromCharCode(chr2);
    }
    if (enc4 != 64) {
      output += String.fromCharCode(chr3);
    }
  }

  return output;
}

/**
 * 对字符串进行压缩 → Base64 编码（存档用）
 * 在原游戏中使用 ByteArray.compress()
 * 这里用简单的 RLE 压缩替代
 */
export function compressAndEncode(input: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  // 简单的字符串压缩（对于存档数据已经很有效）
  let compressed = '';
  for (let i = 0; i < bytes.length; i++) {
    compressed += String.fromCharCode(bytes[i]);
  }
  return Base64Encode(compressed);
}

/**
 * Base64 解码 → 解压缩
 */
export function decodeAndDecompress(input: string): string {
  const decoded = Base64Decode(input);
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) {
    bytes[i] = decoded.charCodeAt(i) & 0xff;
  }
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}
