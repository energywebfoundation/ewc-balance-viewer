import * as React from 'react';
import Web3 = require('web3');
import { Balance } from './Balance';
import { CHAIN_ID, HOLDING_CONTRACT_ADDRESS, HOLDING_CONTRACT_ABI } from '../Settings';


interface AppContainerState {
    web3: any,
    holdingContract: any,
    chainId: number
}



export class AppContainer extends React.Component<{}, AppContainerState> {

    constructor(props: any) {
        super(props);
        this.state = {
            web3: null,
            holdingContract: null,
            chainId: null
        }
    }

    async componentDidMount() {
        const web3 = new Web3('ws://localhost:8546' || Web3.givenProvider);
        const holdingContract = new web3.eth.Contract(HOLDING_CONTRACT_ABI as any, HOLDING_CONTRACT_ADDRESS);
        const chainId = await web3.eth.net.getId();
        this.setState({
             web3,
             holdingContract,
             chainId
        })

    }
    //TODO: get net id from chainspec
    render() {
   
        return <div className='container'>
            <h1 className='text-center text-muted space'>EWC Balance Viewer</h1>
            
            {this.state.chainId === CHAIN_ID ? 
                <Balance web3={this.state.web3} holdingContract={this.state.holdingContract} /> : 
                <div className='alert alert-warning space' role='alert'>
                    <strong>You are not connected to the Energy Web Chain.</strong> To connect to the Enery Web Chain run a local node at ws://localhost:8546 or use MetaMask and connect to a public RPC.
                </div>    
            }
            
            <div className='row more-space'>
                <img className='center' src='/assets/energy-web-logo-final.svg' alt='light logo' />
            </div>
        </div>
        
    }
}