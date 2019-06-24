import * as React from 'react';
import Web3 = require('web3');
import { Balance } from './Balance';
import {
    EWC_CHAIN_ID,
    VOLTA_CHAIN_ID,
    HOLDING_CONTRACT_ADDRESS,
    HOLDING_CONTRACT_ABI
} from '../Settings';


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
        let web3;
        if ((window as any).ethereum) {
            web3 = new Web3((window as any).ethereum);
            await (window as any).ethereum.enable();
        } else if ((window as any).web3) {
            web3 = new Web3((window as any).web3.currentProvider);
        } else {
            web3 = new Web3('ws://localhost:8546');
        }
        const holdingContract = new web3.eth.Contract(HOLDING_CONTRACT_ABI as any, HOLDING_CONTRACT_ADDRESS);
        const chainId = await web3.eth.net.getId();
        this.setState({
             web3,
             holdingContract,
             chainId
        });
    }

    renderBalance() {
        if (this.state.chainId === VOLTA_CHAIN_ID) {
            return [
                <div className='alert alert-success space text-center' role='alert'>
                    Successfully connected to <strong>Volta</strong>. This is a <strong>testnet</strong>.
                </div>,
                <Balance web3={this.state.web3} holdingContract={this.state.holdingContract} />
            ]
        } else if (this.state.chainId === EWC_CHAIN_ID) {
            return [
                <div className='alert alert-success space text-center' role='alert'>
                    Successfully connected to <strong>Energy Web Chain</strong>. This is the <strong>production chain</strong>.
                </div>,
                <Balance web3={this.state.web3} holdingContract={this.state.holdingContract} />
            ]
        } else {
            return <div className='alert alert-warning space' role='alert'>
                <strong>You are not connected to Energy Web Chain or Volta test network.</strong> To connect to the Enery Web Chain or Volta, run a local node at http://localhost:8545 or use MetaMask and connect to a public RPC.
            </div>
        }
    }

    render() {
   
        return <div className='container'>
            <h1 className='text-center text-muted space'>Holding Contract UI</h1>

            {this.renderBalance()}
            
            <div className='row more-space'>
                <img className='center' src='/assets/energy-web-logo-final.svg' alt='light logo' />
            </div>
        </div>
        
    }
}
