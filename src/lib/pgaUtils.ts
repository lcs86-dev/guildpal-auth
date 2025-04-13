import { client, pga } from "./auth-client";

export async function setupPGAAuth(sessionData: unknown): Promise<void> {
  // const session = await client.getSession();
  // if (session.error) {
  //   console.error("Failed to get session")
  //   return;
  // }
  if (!window.pga) {
    console.error("PGA not found")
    return;
  }
  try {
    await window.pga.helpers.setAuthToken(sessionData);
    const mid = await window.pga.helpers.getEncryptedMid();
    await pga.addMid({ encryptedMid: mid });
    console.log('PGA authentication setup complete', { mid });
  } catch (error) {
    console.error('Failed to setup PGA authentication:', error);
  }
}
