/**
 * AES-CBC 암호화 유틸리티 
 * aes-js 라이브러리 사용 (공식 예제 방식 구현)
 */

import aesjs from 'aes-js';
import { MID_ENCRYPTION_KEY } from '$env/static/private';

// 암호화 키 (32바이트 고정)
// const ENCRYPTION_KEY_STR = "";

function getKeyBytes(): Uint8Array {
  // 키 길이 확인 (32바이트여야 함)
  if (!MID_ENCRYPTION_KEY || MID_ENCRYPTION_KEY.length < 32) {
    console.warn('MID_ENCRYPTION_KEY is missing or too short, using default key');
    // 기본 키 사용 (프로덕션에서는 사용하지 말 것)
    return new Uint8Array(32).fill(1);
  }

  // 32바이트로 자르거나 패딩
  const key = MID_ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32);
  return new TextEncoder().encode(key);
}

function removePadding(data: Uint8Array): Uint8Array {
  if (!data || data.length === 0) return new Uint8Array(0);
  const paddingLength = data[data.length - 1];
  if (paddingLength <= 0 || paddingLength > data.length) return data;
  return data.slice(0, data.length - paddingLength);
}

// 16진수 문자열 유효성 확인
function isValidHex(str: string): boolean {
  return /^[0-9a-fA-F]+$/.test(str);
}

// Base64 문자열 유효성 확인
function isValidBase64(str: string): boolean {
  return /^[A-Za-z0-9+/]*={0,2}$/.test(str);
}

// Base64 문자열을 바이트 배열로 변환
function base64ToBytes(base64: string): Uint8Array {
  try {
    // URL 인코딩 관련 문자 처리
    const normalizedBase64 = base64
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const binaryString = atob(normalizedBase64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  } catch (e) {
    console.error('Invalid base64 string:', e);
    return new Uint8Array(0);
  }
}

/**
 * AES-CBC 복호화 (암호문 → 평문)
 * 암호문은 IV + 암호문의 hex 인코딩 문자열
 */
export function decrypt(encryptedStr: string): string {


  try {
    if (!encryptedStr) {
      throw new Error("encryptedStr is empty or undefined")
    }

    // 입력 문자열 형식 감지 및 변환
    let encryptedBytes: Uint8Array;

    // URL-safe base64 문자 정규화
    const normalizedStr = encryptedStr
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    if (isValidHex(encryptedStr)) {
      // 16진수 형식인 경우
      encryptedBytes = aesjs.utils.hex.toBytes(encryptedStr);
    } else if (isValidBase64(encryptedStr) || isValidBase64(normalizedStr)) {
      // Base64 형식인 경우
      encryptedBytes = base64ToBytes(encryptedStr);
    } else {
      // URL이나 다른 형식인 경우, 디코딩 시도
      try {
        const decoded = decodeURIComponent(encryptedStr);
        if (isValidHex(decoded)) {
          encryptedBytes = aesjs.utils.hex.toBytes(decoded);
        } else if (isValidBase64(decoded)) {
          encryptedBytes = base64ToBytes(decoded);
        } else {
          // 마지막 수단: 입력을 UTF-8 바이트로 해석
          encryptedBytes = new TextEncoder().encode(encryptedStr);
        }
      } catch (e) {
        encryptedBytes = new TextEncoder().encode(encryptedStr);
      }
    }

    // 데이터 길이 검증
    if (encryptedBytes.length < 32) {
      throw new Error("Encrypted data too short")
    }

    // IV와 암호문 분리
    const iv = encryptedBytes.slice(0, 16);
    const encrypted = encryptedBytes.slice(16);

    // 키 바이트로 변환
    const keyBytes = getKeyBytes();

    // 바이트 배열 유효성 검사
    for (let i = 0; i < iv.length; i++) {
      if (isNaN(iv[i])) {
        throw new Error(`Invalid IV byte at position ${i}: ${iv[i]}`);
      }
    }

    for (let i = 0; i < encrypted.length; i++) {
      if (isNaN(encrypted[i])) {
        throw new Error(`Invalid encrypted byte at position ${i}: ${encrypted[i]}`);
      }
    }

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

