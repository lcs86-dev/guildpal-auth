import { getJwtToken, jwt } from "@atomrigslab/better-auth/plugins";
import axios from 'axios';
import { client, pga } from "./auth-client";
import { env as publicEnv } from '$env/dynamic/public';

// 로그인 성공 후 PGA 설정
export async function setupPGAAuth(
  sessionData: { user: any, session: any, mids: string[] },
): Promise<boolean> {
  if (!window.pga) {
    console.error("PGA not found");
    return false;
  }

  try {
    const sessionToken = sessionData.session.token;
    const tRes = await axios({
      method: 'GET',
      url: `${publicEnv.PUBLIC_AUTH_SERVICE_ORIGIN}/api/auth/token`,
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

    const pgaMidStr = window.localStorage.getItem('pga-mid');
    const pgaMidData = JSON.parse(pgaMidStr || '{}');

    let mids = [...sessionData.mids];
    if (pgaMidData.mid && !sessionData.mids.includes(pgaMidData.mid) && pgaMidData.encryptedMid) {
      await pga.addMid({ encryptedMid: pgaMidData.encryptedMid });
      mids = [...mids, pgaMidData.mid];
    }

    await window.pga.helpers.setAuthData({
      mids,
      jwtToken,
    });

    console.log('PGA authentication complete');
    return true;
  } catch (error) {
    console.error('Failed to setup PGA authentication:', error);
    return false;
  }
}
