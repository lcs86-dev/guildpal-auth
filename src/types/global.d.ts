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
      getMid: () => Promise<{mid: string, encrypted: string}>;
    };
    [key: string]: any;
  };
} 