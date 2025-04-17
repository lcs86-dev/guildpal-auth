const defaultMid = {
  mid: '',
  encryptedMid: '',
}

// MID 초기화: 페이지 첫 로드 시 호출
export async function initializeMid(): Promise<{ mid: string; encryptedMid: string } | null> {
  try {
    if (!window.pga?.helpers?.getMid) {
      return defaultMid;
    }
    const midFromPga = await window.pga.helpers.getMid();
    if (midFromPga.mid && midFromPga.encryptedMid) {
      window.localStorage.setItem('pga-mid', JSON.stringify(midFromPga));
    }
    return { mid: midFromPga.mid, encryptedMid: midFromPga.encryptedMid };
  } catch (error) {
    console.error('Failed to initialize PGA MID:', error);
    return defaultMid;
  }
} 