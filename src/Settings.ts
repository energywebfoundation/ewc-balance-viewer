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
        origin: '0x523C26149f9E1B4A3D9FA6FB6a08f89339B8D39F'
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