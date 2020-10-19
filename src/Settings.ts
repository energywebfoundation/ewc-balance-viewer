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
        originRegistry: '0xF5A42bbBc7Be3CE56fA5e0e16b255fB328006e97'
      }
  },
  [Network.EWC.toString()]: {
      name: 'Energy Web Chain',
      type: 'production chain',
      contracts: {
        origin: ''
      }
  }
}
