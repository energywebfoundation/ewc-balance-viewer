export const HOLDING_CONTRACT_ADDRESS = '0x1204700000000000000000000000000000000004';
export const ORIGIN_CERTIFICATES_ADDRESS = '0x0D9A992A627bda5f869632328d300a90F6A4f88D';

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