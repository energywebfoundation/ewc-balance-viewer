export const HOLDING_CONTRACT_ADDRESS = '0x1204700000000000000000000000000000000004';
export const ORIGIN_CERTIFICATES_ADDRESS = '0x523C26149f9E1B4A3D9FA6FB6a08f89339B8D39F';

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