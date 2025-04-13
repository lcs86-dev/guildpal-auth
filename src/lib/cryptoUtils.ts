/**
 * AES-CBC 암호화 유틸리티 
 * aes-js 라이브러리 사용 (공식 예제 방식 구현)
 */

import * as aesjs from 'aes-js';

// 암호화 키 (32바이트 고정)
const ENCRYPTION_KEY_STR = "";

function getKeyBytes(): Uint8Array {
  return new TextEncoder().encode(ENCRYPTION_KEY_STR);
}

function removePadding(data: Uint8Array): Uint8Array {
  const paddingLength = data[data.length - 1];
  return data.slice(0, data.length - paddingLength);
}

/**
 * AES-CBC 복호화 (암호문 → 평문)
 * 암호문은 IV + 암호문의 hex 인코딩 문자열
 */
export function decrypt(encryptedHex: string): string {
  try {
    // 16진수 문자열을 바이트로 변환
    const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
    
    // IV와 암호문 분리
    const iv = encryptedBytes.slice(0, 16);
    const encrypted = encryptedBytes.slice(16);
    
    // 키 바이트로 변환
    const keyBytes = getKeyBytes();
    
    // AES-CBC 복호화
    const aesCbc = new aesjs.ModeOfOperation.cbc(keyBytes, iv);
    const decryptedBytes = aesCbc.decrypt(encrypted);
    
    // 패딩 제거
    const unpaddedBytes = removePadding(decryptedBytes);
    
    // 바이트를 문자열로 변환
    return aesjs.utils.utf8.fromBytes(unpaddedBytes);
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
}

