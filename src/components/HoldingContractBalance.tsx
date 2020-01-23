import * as React from 'react';

export interface HelloProps { compiler: string; framework: string; }

interface HoldingContractBalanceProps {
    web3: any,
    holdingContract: any,
    accountAddress: string
}

interface HoldingContractBalanceState {
    balance: any,
    lockedUntilBlockTimestamp: string,
    valid: boolean,
    errorMsg: string
}

export class HoldingContractBalance extends React.Component<HoldingContractBalanceProps, HoldingContractBalanceState> {

    constructor(props: any) {
        super(props);
        this.state = {
            valid: false,
            balance: null,
            lockedUntilBlockTimestamp: null,
            errorMsg: null
        };
        this.onWithdrawClick = this.onWithdrawClick.bind(this);
        this.isWithdrawAble = this.isWithdrawAble.bind(this); 
    }

    componentDidUpdate(prevProps: HoldingContractBalanceProps) {
        if (this.props.accountAddress !== prevProps.accountAddress) {
            this.getHoldingData();
        }
    }

    async componentDidMount() {
        await this.getHoldingData();
    }

    async getHoldingData() {
        const { web3, accountAddress, holdingContract } = this.props;

        let balance = null;
        let lockedUntilBlockTimestamp = null;

        const isValidAddress = web3.utils.isAddress(accountAddress);

        if (isValidAddress) {
            const holder  = await holdingContract.methods.holders(accountAddress).call()
            balance = holder.availableAmount;
            lockedUntilBlockTimestamp = holder.lockedUntilBlockTimestamp;
        }

        this.setState({
            balance,
            lockedUntilBlockTimestamp,
            valid: isValidAddress,
            errorMsg: null
        });
    }

    isWithdrawAble() {
        return this.state.balance && this.state.balance !== '0' && Math.floor(Date.now() / 1000) > parseInt(this.state.lockedUntilBlockTimestamp)
    }

    async onWithdrawClick() {
        this.setState({ errorMsg: null });

        if(!this.state.balance || this.state.balance === '0') {
            this.setState({ errorMsg: 'Can not withdraw because the held balance is 0.' });
        } else if (Math.floor(Date.now() / 1000) <= parseInt(this.state.lockedUntilBlockTimestamp)) {
            this.setState({ errorMsg: 'Can not withdraw because the holding period is not over.' });
        } else {
            try {
                const accounts = await this.props.web3.eth.getAccounts();
                await this.props.holdingContract.methods.releaseFunds(this.props.accountAddress).send({
                    from: accounts[0]
                });
                this.getHoldingData();
            } catch(e) {
                console.error(e);
                this.setState({ errorMsg: 'Error while executing withdraw transaction.' });
            } 
        }
    }

    render() {
        return <div>
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
                                        this.state.lockedUntilBlockTimestamp && this.state.lockedUntilBlockTimestamp !== '0' ?
                                        (new Date(parseInt(this.state.lockedUntilBlockTimestamp) * 1000)).toLocaleString() :
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
                {!this.state.valid && this.props.accountAddress !== null && this.props.accountAddress !== '' &&
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
        </div>;
    }
}
