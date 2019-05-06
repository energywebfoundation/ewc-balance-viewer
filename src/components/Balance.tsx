import * as React from 'react';
import Web3 = require('web3');

export interface HelloProps { compiler: string; framework: string; }

interface BalanceProps {
    web3: any,
    holdingContract: any
}

interface BalanceState {
    balance: any,
    accountAddress: string,
    lockedUntilBlocktimestamp: string,
    valid: boolean
}

export class Balance extends React.Component<BalanceProps, BalanceState> {

    constructor(props: any) {
        super(props);
        this.state = {
            valid: false,
            balance: null,
            accountAddress: null, 
            lockedUntilBlocktimestamp: null
        }
        this.onAddressChange = this.onAddressChange.bind(this);
    }

    async componentWillReceiveProps(newProps: BalanceProps) {
        if (newProps.web3) {
            const accounts = newProps.web3.eth.getAccounts();
            if (accounts[0]) {
                const holder  = await this.props.holdingContract.methods.holders(accounts[0]).call()
                this.setState({
                    accountAddress: accounts[0],
                    balance: holder.availableAmount,
                    lockedUntilBlocktimestamp: holder.lockedUntilBlocktimestamp
                })
            }
        }
    }


    async onAddressChange(event: any) {
        event.persist();
        const address = event.target.value;

        if (this.props.web3.utils.isAddress(address)) {
            const holder  = await this.props.holdingContract.methods.holders(address).call()
            this.setState({
                accountAddress: address,
                balance: holder.availableAmount,
                lockedUntilBlocktimestamp: holder.lockedUntilBlocktimestamp,
                valid: true
            })

        } else {
            this.setState({
                accountAddress: address,
                balance: null,
                lockedUntilBlocktimestamp: null,
                valid: false
            })
        }

    }

    render() {
        return <div>
            <div className='row space'>
                <div className='col'>
                    <input type='text' className='form-control text-center' placeholder='Paste account address' onChange={this.onAddressChange}/>
                </div>
            </div>
            <div className='row'>
                <div className='col text-center'>
                {this.state.balance !== null && 
                    <div>
                        <div className='card space'>
                            <div className='card-body'>
                                <h2 className='card-title'>
                                    {new Intl.NumberFormat('en-US').format(this.props.web3.utils.fromWei(this.state.balance, 'ether'))}
                                </h2>
                                <h6 className='card-subtitle mb-2 text-muted'>Energy Web Token</h6>
                            </div>
                        </div>
                        <div className='card space'>
                            <div className='card-body'>
                                <h2 className='card-title'>
                                    {
                                        this.state.lockedUntilBlocktimestamp && this.state.lockedUntilBlocktimestamp !== '0' ?
                                        (new Date(parseInt(this.state.lockedUntilBlocktimestamp) * 1000)).toLocaleString() :
                                        '-'
                                    }
                                </h2>
                                <h6 className='card-subtitle mb-2 text-muted'>Release Time</h6>
                            </div>
                        </div>
                    </div>
                }
                {!this.state.valid && this.state.accountAddress !== null  &&  this.state.accountAddress !== '' &&
                    <div className='alert alert-warning space' role='alert'>
                        <strong>Account address is not valid.</strong>
                    </div>  
                }
                </div>
            </div>
        </div>
    }
}