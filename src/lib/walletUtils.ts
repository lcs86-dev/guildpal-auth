import { BrowserProvider, ethers } from 'ethers';
import { SiweMessage } from 'siwe';

// 지갑 유형 인터페이스
export interface WalletConfig {
  name: string;
  providerKey: 'ronin' | 'ethereum';
  isWalletAvailable: (window: Window) => boolean;
  getProvider: (window: Window) => any;
  statement: string;
  walletName: string;
}

// 지갑 설정
export const walletConfigs: Record<string, WalletConfig> = {
  ronin: {
    name: 'Ronin Wallet',
    providerKey: 'ronin',
    isWalletAvailable: (window) => !!window?.ronin?.provider,
    getProvider: (window) => {
      if (!window?.ronin?.provider) {
        throw new Error('Ronin wallet provider not found');
      }
      return window.ronin.provider;
    },
    statement: 'Sign in with Ronin to the Guildpal.',
    walletName: 'ronin'
  },
  metamask: {
    name: 'MetaMask',
    providerKey: 'ethereum',
    isWalletAvailable: (window) => !!window?.ethereum && !!window?.ethereum?.isMetaMask,
    getProvider: (window) => window.ethereum,
    statement: 'Sign in with Ethereum to the Guildpal.',
    walletName: 'metamask'
  }
};

export interface WalletResult {
  success: boolean;
  error?: string;
  sessionData?: any;
  address?: string;
}

// 지갑 로그인 처리 함수
export async function walletSignIn(
  walletType: 'ronin' | 'metamask',
  signInClient: any,
  clientGetter: any,
  pgaHelper: any
): Promise<WalletResult> {
  // 지갑 설정 가져오기
  const walletConfig = walletConfigs[walletType];

  try {
    // 지갑 사용 가능 여부 확인
    if (!walletConfig.isWalletAvailable(window)) {
      return {
        success: false,
        error: `${walletConfig.name} not found. Please install the extension.`
      };
    }

    const provider = new BrowserProvider(walletConfig.getProvider(window));

    try {
      // 계정 요청
      const addresses = await provider.send('eth_requestAccounts', []);
      const address = ethers.getAddress(addresses[0]);

      // 서명자 가져오기
      const signer = await provider.getSigner();

      // 체인 ID 가져오기
      const chainIdHex = await provider.send('eth_chainId', []);
      const chainId = parseInt(chainIdHex, 16);

      // 논스 가져오기
      const nonceResponse = await signInClient.nonce({ address });
      if (nonceResponse.error) {
        return {
          success: false,
          error: 'Failed to get authentication nonce. Please try again.'
        };
      }

      // 메시지 파라미터 준비
      const messageParams = {
        scheme: window.location.protocol.slice(0, -1),
        domain: window.location.host,
        address,
        statement: walletConfig.statement,
        uri: window.location.origin,
        version: '1',
        nonce: nonceResponse.data?.nonce,
        chainId: chainId // 지갑에서 가져온 chainId 사용
      };

      // 메시지 생성 및 서명
      const message = new SiweMessage(messageParams);
      const messageToSign = message.prepareMessage();
      const signature = await signer.signMessage(messageToSign);

      if (walletType === 'metamask') {
        console.log('signature and messageToSign', { signature, messageToSign });
      }

      // 서명 검증
      const result = await signInClient.verify({
        message: messageToSign,
        signature,
        address,
        walletName: walletConfig.walletName
      });
      if (result.error) {
        return {
          success: false,
          error: result.error?.messsage || 'Failed to verify signature. Please try again.'
        };
      }

      return {
        success: true,
        // sessionData: session.data,
        address
      };

    } catch (error: any) {
      console.error(`${walletConfig.name} request error:`, error);

      if (error.code === 4001) {
        return {
          success: false,
          error: 'You declined the signature request. Please try again and approve the request.'
        };
      } else {
        return {
          success: false,
          error: `Failed to connect with ${walletConfig.name}. Please try again.`
        };
      }
    }
  } catch (error: any) {
    console.error(`${walletConfig.name} sign-in error:`, error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

// 지갑 연결 처리 함수
export async function walletLink(
  walletType: 'ronin' | 'metamask',
  signInClient: any,
  clientGetter: any,
): Promise<WalletResult> {
  // 지갑 설정 가져오기
  const walletConfig = walletConfigs[walletType];

  try {
    // 지갑 사용 가능 여부 확인
    if (!walletConfig.isWalletAvailable(window)) {
      return {
        success: false,
        error: `${walletConfig.name} not found. Please install the extension.`
      };
    }

    const provider = new BrowserProvider(walletConfig.getProvider(window));

    try {
      // 계정 요청
      const addresses = await provider.send('eth_requestAccounts', []);
      const address = ethers.getAddress(addresses[0]);

      // 서명자 가져오기
      const signer = await provider.getSigner();

      // 체인 ID 가져오기
      const chainIdHex = await provider.send('eth_chainId', []);
      const chainId = parseInt(chainIdHex, 16);

      // 논스 가져오기
      const nonceResponse = await signInClient.nonce({ address });
      if (nonceResponse.error) {
        return {
          success: false,
          error: 'Failed to get authentication nonce. Please try again.'
        };
      }

      // 메시지 파라미터 준비
      const messageParams = {
        scheme: window.location.protocol.slice(0, -1),
        domain: window.location.host,
        address,
        statement: walletConfig.statement,
        uri: window.location.origin,
        version: '1',
        nonce: nonceResponse.data?.nonce,
        chainId: chainId // 지갑에서 가져온 chainId 사용
      };

      // 메시지 생성 및 서명
      const message = new SiweMessage(messageParams);
      const messageToSign = message.prepareMessage();
      const signature = await signer.signMessage(messageToSign);

      // 지갑 연결 요청
      const result = await signInClient.walletLink({
        message: messageToSign,
        signature,
        address,
        walletName: walletConfig.walletName
      });

      if (result.error) {
        return {
          success: false,
          error: `Failed to link ${walletConfig.name}. Please try again.`
        };
      }

      // MID 추가 (필요한 경우)
      // try {
      //   await pgaHelper.addMid({ encryptedMid: pgaMid });
      //   console.log('add mid success');
      // } catch (midError) {
      //   console.error('Failed to add MID:', midError);
      //   // MID 추가 실패는 치명적인 오류로 간주하지 않음
      // }

      // 세션 가져오기
      const session = await clientGetter.getSession();

      if (session.error) {
        return {
          success: false,
          error: 'Session refresh failed after wallet linking. Please try again.'
        };
      }

      return {
        success: true,
        sessionData: session.data,
        address
      };

    } catch (error: any) {
      console.error(`${walletConfig.name} link request error:`, error);

      if (error.code === 4001) {
        return {
          success: false,
          error: 'You declined the signature request. Please try again and approve the request.'
        };
      } else {
        return {
          success: false,
          error: `Failed to connect with ${walletConfig.name}. Please try again.`
        };
      }
    }
  } catch (error: any) {
    console.error(`${walletConfig.name} link error:`, error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
} 