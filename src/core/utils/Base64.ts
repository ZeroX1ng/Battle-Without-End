const _base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function encodeBytes(bytes: Uint8Array): string {
  let output = '';
  let i = 0;

  while (i < bytes.length) {
    const chr1 = bytes[i++];
    const chr2 = i < bytes.length ? bytes[i++] : NaN;
    const chr3 = i < bytes.length ? bytes[i++] : NaN;

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

function decodeBytes(input: string): Uint8Array {
  const bytes: number[] = [];
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

    bytes.push(chr1);
    if (enc3 !== 64) {
      bytes.push(chr2);
    }
    if (enc4 !== 64) {
      bytes.push(chr3);
    }
  }

  return new Uint8Array(bytes);
}

export function Base64Encode(input: string): string {
  return encodeBytes(new TextEncoder().encode(input));
}

export function Base64Decode(input: string): string {
  return new TextDecoder().decode(decodeBytes(input));
}

export function compressAndEncode(input: string): string {
  return Base64Encode(input);
}

export function decodeAndDecompress(input: string): string {
  return Base64Decode(input);
}
