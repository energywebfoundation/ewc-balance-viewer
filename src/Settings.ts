export const HOLDING_CONTRACT_ADDRESS = '0x1204700000000000000000000000000000000004';

export enum Network {
  Volta = 73799,
  EWC = 246
}

export const NetworkProperties = {
  [Network.Volta.toString()]: {
      name: 'Volta',
      type: 'testnet',
      contracts: {
        originRegistry: '0xbDa87bBfc5C64fbF9F43E0Bb7C269F93F9e9CB95',
        originIssuer: '0xe155530d8C8160c249E2acA5d6536b5e27913eDE'
      }
  },
  [Network.EWC.toString()]: {
      name: 'Energy Web Chain',
      type: 'production chain',
      contracts: {
        originRegistry: '0xdB4837e3Eb55115f5976b45F4102470F56e68F2d',
        originIssuer: '0x7038F3294c48aaf257026cc55a386A31F2A8fb3c'
      }
  }
}
