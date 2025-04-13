/**
 * AES-CBC 암호화 테스트 스크립트 (문서 예제 방식으로 구현)
 * 
 * 사용법:
 * - 먼저 aes-js를 설치: npm install aes-js
 * - 실행: node test/test-crypto.js
 */

// ESM 방식으로 임포트
import aesjs from 'aes-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 예제 코드 - 문서 예제와 동일한 방식으로 구현
 */
function runExample() {
  console.log("=== AES-CBC 문서 예제 구현 ===");
  
  // An example 128-bit key (16 bytes * 8 bits = 128 bits)
  const key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  
  // The initialization vector (must be 16 bytes)
  const iv = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];
  
  // Convert text to bytes (text must be a multiple of 16 bytes)
  const text = 'TextMustBe16Byte';
  console.log(`원본 텍스트: ${text}`);
  
  const textBytes = aesjs.utils.utf8.toBytes(text);
  
  // 암호화
  const aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
  const encryptedBytes = aesCbc.encrypt(textBytes);
  
  // 바이트를 16진수 문자열로 변환
  const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
  console.log(`암호화된 16진수: ${encryptedHex}`);
  
  // 복호화를 위해 16진수 문자열을 다시 바이트로 변환
  const encryptedBytesForDecryption = aesjs.utils.hex.toBytes(encryptedHex);
  
  // 새 인스턴스 생성 (CBC 모드는 내부 상태를 유지하므로)
  const aesCbcForDecryption = new aesjs.ModeOfOperation.cbc(key, iv);
  const decryptedBytes = aesCbcForDecryption.decrypt(encryptedBytesForDecryption);
  
  // 바이트를 다시 텍스트로 변환
  const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
  console.log(`복호화된 텍스트: ${decryptedText}`);
  console.log(`결과: ${text === decryptedText ? '성공 ✓' : '실패 ✗'}`);
  console.log('-'.repeat(50));
}

/**
 * PKCS#7 패딩 추가
 */
function addPadding(data) {
  const blockSize = 16;
  const paddingLength = blockSize - (data.length % blockSize);
  const paddedData = new Uint8Array(data.length + paddingLength);
  paddedData.set(data);
  
  // 패딩 추가 (PKCS#7 방식)
  for (let i = 0; i < paddingLength; i++) {
    paddedData[data.length + i] = paddingLength;
  }
  
  return paddedData;
}

/**
 * PKCS#7 패딩 제거
 */
function removePadding(data) {
  const paddingLength = data[data.length - 1];
  return data.slice(0, data.length - paddingLength);
}

/**
 * 랜덤 IV(Initialization Vector) 생성 (16바이트)
 */
async function generateIV() {
  // Node.js의 crypto API를 ESM 방식으로 임포트하여 사용
  const crypto = await import('crypto');
  return new Uint8Array(crypto.randomBytes(16));
}

/**
 * AES-CBC 암호화 (평문 → 암호문)
 * 랜덤 IV를 사용하며, 결과는 IV + 암호문의 hex 인코딩 문자열
 */
async function encrypt(plaintext, key) {
  try {
    // 랜덤 IV 생성 (16바이트)
    const iv = await generateIV();
    
    // 평문을 바이트로 변환 (aes-js의 유틸리티 사용)
    const textBytes = aesjs.utils.utf8.toBytes(plaintext);
    
    // PKCS#7 패딩 추가
    const paddedData = addPadding(textBytes);
    
    // aes-js 라이브러리의 CBC 모드 암호화
    const aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
    const encryptedBytes = aesCbc.encrypt(paddedData);
    
    // IV와 암호문 결합
    const resultBytes = new Uint8Array(iv.length + encryptedBytes.length);
    resultBytes.set(iv, 0);
    resultBytes.set(encryptedBytes, iv.length);
    
    // 16진수 문자열로 변환
    return aesjs.utils.hex.fromBytes(resultBytes);
  } catch (error) {
    console.error('암호화 오류:', error);
    throw error;
  }
}

/**
 * AES-CBC 복호화 (암호문 → 평문)
 * 암호문은 IV + 암호문의 hex 인코딩 문자열
 */
function decrypt(encryptedHex, key) {
  try {
    // 16진수 문자열을 바이트로 변환
    const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
    
    // IV와 암호문 분리
    const iv = encryptedBytes.slice(0, 16);
    const encrypted = encryptedBytes.slice(16);
    
    // aes-js 라이브러리의 CBC 모드 복호화
    const aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
    const decryptedBytes = aesCbc.decrypt(encrypted);
    
    // 패딩 제거
    const unpaddedBytes = removePadding(decryptedBytes);
    
    // 바이트를 문자열로 변환
    return aesjs.utils.utf8.fromBytes(unpaddedBytes);
  } catch (error) {
    console.error('복호화 오류:', error);
    throw error;
  }
}

/**
 * 기본 테스트 실행
 */
async function runBasicTest() {
  // 테스트에 사용할 키
  const key = [];
  for (let i = 1; i <= 32; i++) {
    key.push(i % 256);
  }
  
  const testCases = [
    "Hello, World!",
    "AES-CBC 암호화 테스트",
    "특수문자 !@#$%^&*()",
    "1234567890",
    "한글도 잘 처리되나요?"
  ];
  
  console.log("=== 기본 AES-CBC 암복호화 테스트 ===");
  console.log("-".repeat(50));
  
  let successCount = 0;
  
  for (const plaintext of testCases) {
    try {
      console.log(`원본: "${plaintext}"`);
      
      // 암호화
      const encrypted = await encrypt(plaintext, key);
      console.log(`암호화(hex): ${encrypted}`);
      
      // 복호화
      const decrypted = decrypt(encrypted, key);
      console.log(`복호화: "${decrypted}"`);
      
      // 결과 확인
      const success = plaintext === decrypted;
      console.log(`결과: ${success ? '성공 ✓' : '실패 ✗'}`);
      
      if (success) successCount++;
      console.log("-".repeat(50));
    } catch (error) {
      console.error(`테스트 실패: ${error.message}`);
      console.log("-".repeat(50));
    }
  }
  
  console.log(`총 테스트: ${testCases.length}, 성공: ${successCount}, 실패: ${testCases.length - successCount}`);
  console.log();
}

/**
 * CSV 파일에서 테스트 데이터 로드
 */
function loadTestDataFromCSV(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    const testCases = [];
    
    for (const line of lines) {
      const [plaintext, ciphertext] = line.split(',');
      if (plaintext && ciphertext) {
        testCases.push({ plaintext: plaintext.trim(), ciphertext: ciphertext.trim() });
      }
    }
    
    return testCases;
  } catch (error) {
    console.error(`CSV 파일 로딩 오류: ${error.message}`);
    return [];
  }
}

/**
 * 사용자 정의 테스트 실행
 */
async function runCustomTest(filePath) {
  // 테스트에 사용할 키
  const key = [];
  for (let i = 1; i <= 32; i++) {
    key.push(i % 256);
  }
  
  const testCases = loadTestDataFromCSV(filePath);
  
  if (testCases.length === 0) {
    console.log("유효한 테스트 데이터가 없습니다.");
    return;
  }
  
  console.log(`=== 사용자 정의 테스트 (${filePath}) ===`);
  console.log(`테스트 케이스 수: ${testCases.length}`);
  console.log("-".repeat(50));
  
  let successCount = 0;
  
  for (const testCase of testCases) {
    try {
      console.log(`원본: "${testCase.plaintext}"`);
      
      // 원본으로 새로 암호화
      const encrypted = await encrypt(testCase.plaintext, key);
      console.log(`암호화(hex): ${encrypted}`);
      
      // 복호화
      const decrypted = decrypt(encrypted, key);
      console.log(`복호화: "${decrypted}"`);
      
      // 결과 확인
      const success = testCase.plaintext === decrypted;
      console.log(`결과: ${success ? '성공 ✓' : '실패 ✗'}`);
      
      if (success) successCount++;
      console.log("-".repeat(50));
    } catch (error) {
      console.error(`테스트 실패: ${error.message}`);
      console.log("-".repeat(50));
    }
  }
  
  console.log(`총 테스트: ${testCases.length}, 성공: ${successCount}, 실패: ${testCases.length - successCount}`);
}

// 메인 실행 코드
async function main() {
  // 문서 예제 실행
  runExample();
  
  // 기본 테스트 실행
  await runBasicTest();
  
  // CSV 파일에서 테스트 데이터 로드
  const csvFile = path.join(__dirname, 'testdata.csv');
  if (fs.existsSync(csvFile)) {
    await runCustomTest(csvFile);
  } else {
    console.log(`CSV 파일 "${csvFile}"이 존재하지 않습니다.`);
  }
}

// 스크립트 실행
main().catch(error => {
  console.error('스크립트 실행 오류:', error);
});
