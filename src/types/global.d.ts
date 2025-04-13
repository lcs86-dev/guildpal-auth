interface Window {
  ronin?: {
    provider: any;
  };
  ethereum?: any;
  pga?: {
    helpers: {
      setAuthToken: (data: any) => void;
    };
    [key: string]: any;
  };
} 