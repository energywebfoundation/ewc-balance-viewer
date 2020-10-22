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
        originRegistry: '0xdB4837e3Eb55115f5976b45F4102470F56e68F2d',
        originIssuer: '0x7038F3294c48aaf257026cc55a386A31F2A8fb3c'
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
