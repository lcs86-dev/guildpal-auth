declare module 'aes-js' {
  interface ModeOfOperationCBC {
    encrypt(data: Uint8Array): Uint8Array;
    decrypt(data: Uint8Array): Uint8Array;
  }

  interface ModeOfOperation {
    cbc: {
      new (key: Uint8Array | Array<number>, iv: Uint8Array | Array<number>): ModeOfOperationCBC;
    };
  }

  interface Utils {
    utf8: {
      toBytes(text: string): Uint8Array;
      fromBytes(bytes: Uint8Array): string;
    };
    hex: {
      toBytes(hex: string): Uint8Array;
      fromBytes(bytes: Uint8Array): string;
    };
  }

  export const ModeOfOperation: ModeOfOperation;
  export const utils: Utils;
} 