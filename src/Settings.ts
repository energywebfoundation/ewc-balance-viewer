export const HOLDING_CONTRACT_ADDRESS = '0x1204700000000000000000000000000000000004';
export const ORIGIN_CERTIFICATES_ADDRESS = '0xcaA2a647C4F9Ef9f8e75E94c66f1eee01D8c0b5f';

export const VOLTA_CHAIN_ID = 73799;
export const EWC_CHAIN_ID = 246;

export const NETWORKS = {
  [VOLTA_CHAIN_ID.toString()]: {
      name: 'Volta',
      type: 'testnet'
  },
  [EWC_CHAIN_ID.toString()]: {
      name: 'Energy Web Chain',
      type: 'production chain'
  }
}