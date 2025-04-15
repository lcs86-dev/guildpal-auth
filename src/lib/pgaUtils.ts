import { getJwtToken, jwt } from "@atomrigslab/better-auth/plugins";
import axios from 'axios';
import { client, pga } from "./auth-client";
import { PUBLIC_AUTH_SERVICE_ORIGIN } from '$env/static/public';

export async function setupPGAAuth(sessionData: { user: any, session: any, mids: string[] }): Promise<void> {
  // const session = await client.getSession();
  // if (session.error) {
  //   console.error("Failed to get session")
  //   return;
  // }
  // get mid

  if (!window.pga) {
    console.error("PGA not found")
    return;
  }

  const sessionToken = sessionData.session.token;
  // Get auth token using session token
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

  try {
    const { mid, encrypted } = await window.pga.helpers.getMid();
    await pga.addMid({ encryptedMid: encrypted });

    await window.pga.helpers.setAuthData({
      mids: [...sessionData.mids, mid],
      jwtToken,
    });
    console.log('PGA authentication setup complete', { mid });
  } catch (error) {
    console.error('Failed to setup PGA authentication:', error);
  }
}
