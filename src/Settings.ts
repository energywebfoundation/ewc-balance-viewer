export const HOLDING_CONTRACT_ABI = [
    {
        'constant': true,
        'inputs': [
            {
            'name': '',
            'type': 'address'
            }
        ],
        'name': 'holders',
        'outputs': [
            {
            'name': 'availableAmount',
            'type': 'uint256'
            },
            {
            'name': 'lockedUntilBlocktimestamp',
            'type': 'uint256'
            }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
    }, 
    {
        "constant": false,
        "inputs": [
          {
            "name": "holderAddress",
            "type": "address"
          }
        ],
        "name": "releaseFunds",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }
];

export const HOLDING_CONTRACT_ADDRESS = '0x1204700000000000000000000000000000000004';

export const VOLTA_CHAIN_ID = 73799;
export const EWC_CHAIN_ID = 246;
