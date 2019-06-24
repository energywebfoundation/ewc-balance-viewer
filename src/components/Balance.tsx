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
    valid: boolean,
    errorMsg: string
}

export class Balance extends React.Component<BalanceProps, BalanceState> {

    constructor(props: any) {
        super(props);
        this.state = {
            valid: false,
            balance: null,
            accountAddress: null, 
            lockedUntilBlocktimestamp: null,
            errorMsg: null
        }
        this.onAddressChange = this.onAddressChange.bind(this);
        this.onWithdrawClick = this.onWithdrawClick.bind(this);
        this.isWithdrawAble = this.isWithdrawAble.bind(this); 
    }

    async componentWillReceiveProps(newProps: BalanceProps) {
        this.fillWithFirstAddress(newProps);
    }

    async fillWithFirstAddress(props: BalanceProps) {
        if (props.web3) {
            const accounts = await props.web3.eth.getAccounts();
            if (accounts[0] && accounts[0] !== this.state.accountAddress) {
                const holder  = await this.props.holdingContract.methods.holders(accounts[0]).call()
                
                this.setState({
                    accountAddress: accounts[0],
                    balance: holder.availableAmount,
                    lockedUntilBlocktimestamp: holder.lockedUntilBlocktimestamp,
                    errorMsg: null
                }, () => {
                    this.getHoldingData(accounts[0])
                })
            }
        }
    }

    async componentDidMount() {
        await this.fillWithFirstAddress(this.props);
        
    }

    async getHoldingData(address: string) {
        if (this.props.web3.utils.isAddress(address)) {
            const holder  = await this.props.holdingContract.methods.holders(address).call()
            this.setState({
                accountAddress: address,
                balance: holder.availableAmount,
                lockedUntilBlocktimestamp: holder.lockedUntilBlocktimestamp,
                valid: true,
                errorMsg: null
            })

        } else {
            this.setState({
                accountAddress: address,
                balance: null,
                lockedUntilBlocktimestamp: null,
                valid: false,
                errorMsg: null
            })
        }
    }

    async onAddressChange(event: any) {
        event.persist();
        this.getHoldingData(event.target.value);

    }

    isWithdrawAble() {
        return this.state.balance && this.state.balance !== '0' && Math.floor(Date.now() / 1000) > parseInt(this.state.lockedUntilBlocktimestamp)
    }

    async onWithdrawClick() {
        this.setState({
            errorMsg: null
        })
        if(!this.state.balance || this.state.balance === '0') {
            this.setState({
                errorMsg: 'Can not withdraw because the holded balance is 0.'
            })
        } else if (Math.floor(Date.now() / 1000) <= parseInt(this.state.lockedUntilBlocktimestamp)) {
            this.setState({
                errorMsg: 'Can not withdraw because the holding period is not over.'
            })
        } else {
            try {
                const accounts = await this.props.web3.eth.getAccounts();
                await this.props.holdingContract.methods.releaseFunds(this.state.accountAddress).send({
                    from: accounts[0]
                })
                this.getHoldingData(this.state.accountAddress)
            } catch(e) {
                console.log(e)
                this.setState({
                    errorMsg: 'Error while executing withdraw transaction.'
                })
            } 
            
        }
    }

    render() {
        return <div>
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
            <div className='row'>
                <div className='col text-center'>
                {this.state.balance !== null && this.state.balance !== '0' && 
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
                        <button type='button' className='btn btn-primary space'  onClick={this.onWithdrawClick}>
                            Withdraw
                        </button>
                    </div>
                }
                {this.state.balance === '0' && 
                    <div className='alert alert-warning space' role='alert'>
                        This account has no funds locked in the holding contract.
                    </div>  
                }
                {!this.state.valid && this.state.accountAddress !== null  &&  this.state.accountAddress !== '' &&
                    <div className='alert alert-warning space' role='alert'>
                        Account address is not valid.
                    </div>  
                }
                {this.state.errorMsg &&
                    <div className='alert alert-danger space' role='alert'>
                        {this.state.errorMsg}
                    </div>  
                }
                </div>
            </div>
        </div>
    }
}
