import { getJwtToken, jwt } from "@atomrigslab/better-auth/plugins";
import axios from 'axios';
import { client, pga } from "./auth-client";
import { PUBLIC_AUTH_SERVICE_ORIGIN } from '$env/static/public';

// 로그인 성공 후 PGA 설정
export async function setupPGAAuth(
  sessionData: { user: any, session: any, mids: string[] },
  midData: { mid: string, encryptedMid: string }
): Promise<boolean> {
  if (!window.pga) {
    console.error("PGA not found");
    return false;
  }

  if (!midData.mid || !midData.encryptedMid) {
    console.error("MID data is missing");
    return false;
  }

  try {
    const sessionToken = sessionData.session.token;
    const tRes = await axios({
      method: 'GET',
      url: `${PUBLIC_AUTH_SERVICE_ORIGIN}/api/auth/token`,
      headers: {
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        Pragma: 'no-cache',
        Authorization: `Bearer ${sessionToken}`
      },
      withCredentials: true
    });
    const jwtToken = tRes.data.token;

    await pga.addMid({ encryptedMid: midData.encryptedMid });

    await window.pga.helpers.setAuthData({
      mids: [...sessionData.mids, midData.mid],
      jwtToken,
    });
    
    console.log('PGA authentication complete');
    return true;
  } catch (error) {
    console.error('Failed to setup PGA authentication:', error);
    return false;
  }
}
