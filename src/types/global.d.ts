interface Window {
  ronin?: {
    provider: any;
  };
  ethereum?: any;
  pga?: {
    helpers: {
      setAuthData: (data?: {
        jwtToken: string;
        mids: string[];
      }) => Promise<void>;
      getMid: () => Promise<{mid: string, encryptedMid: string}>;
    };
    [key: string]: any;
  };
} 