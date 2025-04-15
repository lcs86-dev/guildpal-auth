import { jwtVerify, createLocalJWKSet } from 'jose'
 
 
async function validateToken(token) {
  try {
    /**
     * This is the JWKS that you get from the /api/auth/
     * jwks endpoint
     */
    // const storedJWKS = {
    //   keys: [{
    //     //...
    //   }]
    // };
    // const storedJWKS = {
    //   keys: [{"kid":"eElefAuYGxQgtUDHyIZfNTId2oQ2mKyY","crv":"Ed25519","x":"1dXmLuZHiHN1BgCrQ0p4qSM120tYCVJQubdnAA2Fe_Q","kty":"OKP"}]
    // }
    const storedJWKS = {
      "keys": [
        {
          "crv": "Ed25519",
          "x": "1dXmLuZHiHN1BgCrQ0p4qSM120tYCVJQubdnAA2Fe_Q",
          "kty": "OKP",
          "kid": "eElefAuYGxQgtUDHyIZfNTId2oQ2mKyY"
        }
      ]
    };
    const JWKS = createLocalJWKSet(keys)
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: 'http://localhost:5173', // Should match your JWT issuer, which is the BASE_URL
      audience: 'http://localhost:5173', // Should match your JWT audience, which is the BASE_URL by default
    })
    return payload
  } catch (error) {
    console.error('Token validation failed:', error)
    throw error
  }
}
 
// Usage example
const token = 'your.jwt.token' // this is the token you get from the /api/auth/token endpoint
const payload = await validateToken(token)