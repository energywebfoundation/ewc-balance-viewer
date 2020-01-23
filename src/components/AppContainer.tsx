import * as React from 'react';
import Web3 = require('web3');
import { HoldingContractBalance } from './HoldingContractBalance';
import { OriginCertificatesBalance } from './OriginCertificatesBalance';
import {
    NETWORKS,
    HOLDING_CONTRACT_ADDRESS
} from '../Settings';
import { HOLDING_CONTRACT_ABI } from '../abi/HoldingContractABI';

enum MenuItem {
    HOLDING_CONTRACT = 'Holding Contract',
    ORIGIN_CERTIFICATES = 'Origin Certificates'
}

interface AppContainerState {
    web3: any,
    holdingContract: any,
    originCertificatesContract: any,
    chainId: number,
    accountAddress: string,
    currentMenuItem: MenuItem
}

export class AppContainer extends React.Component<{}, AppContainerState> {

    constructor(props: any) {
        super(props);

        this.state = {
            web3: null,
            holdingContract: null,
            originCertificatesContract: null,
            chainId: null,
            accountAddress: null,
            currentMenuItem: MenuItem.HOLDING_CONTRACT
        };

        this.onAddressChange = this.onAddressChange.bind(this);
    }

    async componentDidMount() {
        let web3;

        const ethereumInstance = (window as any).ethereum;
        const web3Instance = (window as any).web3;

        if (ethereumInstance) {
            web3 = new Web3(ethereumInstance);
            await ethereumInstance.enable();
        } else {
            web3 = new Web3(web3Instance ?? 'ws://localhost:8546');
        }

        const holdingContract = new web3.eth.Contract(HOLDING_CONTRACT_ABI as any, HOLDING_CONTRACT_ADDRESS);

        const chainId = await web3.eth.net.getId();

        this.setState({
             web3,
             holdingContract,
             chainId
        });

        await this.fillWithFirstAddress();
    }
    
    async fillWithFirstAddress() {
        if (this.state.web3) {
            const accounts = await this.state.web3.eth.getAccounts();

            if (accounts[0] && accounts[0] !== this.state.accountAddress) {                
                this.setState({ accountAddress: accounts[0] });
            }
        }
    }

    async onAddressChange(event: any) {
        event.persist();
        this.setState({ accountAddress: event.target.value });
    }

    async navigateTo(menuItem: MenuItem) {
        this.setState({ currentMenuItem: menuItem });
    }

    render() {
        const { chainId } = this.state;

        const isValidNetwork = Object.keys(NETWORKS).includes(chainId?.toString());

        const menuItems = Object.keys(MenuItem).map(key => (MenuItem as any)[key]);

        return <div className='container'>
            <h1 className='text-center text-muted space'>EWC Balances</h1>

            <div className='row'>
                <div className='col-md-3'>
                    <ul className="nav nav-pills flex-column">
                        {menuItems.map((menuItem, i) => {
                            const isActive = this.state.currentMenuItem == menuItem;

                            return <li key={i} className="nav-item">
                                <a
                                    className={`nav-link ${isActive ? 'active' : ''}`}
                                    onClick={() => this.navigateTo(menuItem)}
                                >{menuItem}</a>
                            </li>;
                        })}
                    </ul>
                </div>

                <div className='col-md-9'>
                    {isValidNetwork && <>
                        <div className='alert alert-success space text-center' role='alert'>
                            Successfully connected to <strong>{NETWORKS[chainId].name}</strong>. This is a <strong>{NETWORKS[chainId].type}</strong>.
                        </div>

                        <div className='row space'>
                            <div className='col'>
                                <input 
                                    type='text'
                                    className='form-control text-center'
                                    placeholder='Paste account address'
                                    onChange={this.onAddressChange}
                                    defaultValue={this.state.accountAddress}
                                />
                            </div>
                        </div>

                        {this.state.currentMenuItem == MenuItem.HOLDING_CONTRACT && 
                            <HoldingContractBalance
                                web3={this.state.web3}
                                holdingContract={this.state.holdingContract}
                                accountAddress={this.state.accountAddress}
                            />
                        }

                        {this.state.currentMenuItem == MenuItem.ORIGIN_CERTIFICATES && 
                            <OriginCertificatesBalance
                                web3={this.state.web3}
                                accountAddress={this.state.accountAddress}
                            />
                        }
                    </>}

                    {!isValidNetwork && 
                        <div className='alert alert-warning space' role='alert'>
                            <strong>You are not connected to Energy Web Chain or Volta test network.</strong> To connect to the Enery Web Chain or Volta, run a local node at http://localhost:8545 or use MetaMask and connect to a public RPC.
                        </div>
                    }
                </div>
            </div>
            
            <div className='row more-space'>
                <img className='center' src='/assets/energy-web-logo-final.svg' alt='light logo' />
            </div>
        </div>
        
    }
}
