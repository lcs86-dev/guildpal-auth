interface Window {
  ronin?: {
    provider: any;
  };
  ethereum?: any;
  pga?: {
    helpers: {
      setAuthToken: (data: any) => Promise<void>;
      getEncryptedMid: () => Promise<string>;
    };
    [key: string]: any;
  };
} 