import type { PageLoad } from './$types';

// 이 페이지는 클라이언트 사이드에서만 실행됨
export const ssr = false;

export const load: PageLoad = async ({ url }) => {
  // const errorCode = url.searchParams.get('error_code') || 'unknown_error';
  const provider = url.searchParams.get('provider') || 'social account';
  const error = url.searchParams.get('error') || 'Authentication error';
  
  return {
    error,
    // errorCode,
    provider
  };
}; 