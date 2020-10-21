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
        originRegistry: '0xBf5c2De6FD2998fd3f061C4a5Ed4dF590c1e95E7',
        originIssuer: '0x3fb506A70f7Ecc411BDE518dC8c4855eDB6Ae499'
      }
  },
  [Network.EWC.toString()]: {
      name: 'Energy Web Chain',
      type: 'production chain',
      contracts: {
        originRegistry: '0xe1148419a10C3aa040bD1c7D1cEf33eca9f0FD61',
        originIssuer: '0x34b6d0b399A07f883cBC86F037B6b1f465c3E153'
      }
  }
}
