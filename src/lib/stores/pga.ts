import { writable, get } from 'svelte/store';

const defaultMid = {
  mid: '',
  encryptedMid: '',
}

export const pgaMid = writable<{
  mid: string;
  encryptedMid: string;
}>(defaultMid);

function getMidFromUrl(): { mid: string, encryptedMid: string } {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    mid: urlParams.get('mid') || '',
    encryptedMid: urlParams.get('encryptedMid') || '',
  }
}

// MID 초기화: 페이지 첫 로드 시 호출
export async function initializeMid(): Promise<{ mid: string; encryptedMid: string } | null> {
  const currentState = get(pgaMid);
  if (currentState.mid) {
    return { mid: currentState.mid, encryptedMid: currentState.encryptedMid };
  }
  
  try {
    // 1. URL 쿼리 파라미터에서 mid 확인
    const midFromUrl = getMidFromUrl();
    if (midFromUrl.mid && midFromUrl.encryptedMid) {
      const result = {
        mid: midFromUrl.mid,
        encryptedMid: midFromUrl.encryptedMid
      };
      
      pgaMid.set(result);
      return result;
    }

    
    // 2. URL에 없으면 PGA 헬퍼에서 가져오기
    if (!window.pga?.helpers?.getMid) {
      return defaultMid;
    }
    const midFromPga = await window.pga.helpers.getMid();
    pgaMid.set({
      mid: midFromPga.mid,
      encryptedMid: midFromPga.encryptedMid,
    });
    
    return { mid: midFromPga.mid, encryptedMid: midFromPga.encryptedMid };
  } catch (error) {
    console.error('Failed to initialize PGA MID:', error);
    return defaultMid;
  }
} 