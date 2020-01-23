import * as React from 'react';
import { ORIGIN_CERTIFICATES_ADDRESS } from '../Settings';
import { ORIGIN_CERTIFICATES_ABI } from '../abi/OriginCertificatesABI';

interface OriginCertificatesBalanceProps {
    web3: any,
    accountAddress: string
}

interface Certificate {
    certId: number,
    energyInWh: number
}

interface OriginCertificatesBalanceState {
    registryContractAddress: string,
    balances: Certificate[],
    validAddress: boolean,
    validContract: boolean,
    errorMsg: string
}

export class OriginCertificatesBalance extends React.Component<OriginCertificatesBalanceProps, OriginCertificatesBalanceState> {

    constructor(props: any) {
        super(props);

        this.state = {
            registryContractAddress: ORIGIN_CERTIFICATES_ADDRESS,
            validAddress: false,
            validContract: false,
            balances: [],
            errorMsg: null
        };

        this.onContractAddressChange = this.onContractAddressChange.bind(this);
    }

    componentDidUpdate(prevProps: OriginCertificatesBalanceProps) {
        if (this.props.accountAddress !== prevProps.accountAddress) {
            this.getData(this.state.registryContractAddress);
        }
    }

    async componentDidMount() {
        await this.getData(this.state.registryContractAddress);
    }

    async getData(registryContractAddress: string) {
        const { web3, accountAddress } = this.props;

        let balances: Certificate[] = [];

        const validAddress = web3.utils.isAddress(accountAddress);
        let validContract = web3.utils.isAddress(registryContractAddress);

        if (validAddress && validContract) {
            const registryContract = new web3.eth.Contract(ORIGIN_CERTIFICATES_ABI as any, registryContractAddress);

            try {
                const certificateIds = await registryContract.methods.allCertificateIds().call({ from: accountAddress });

                for (const certId of certificateIds) {
                    const balance = await registryContract.methods.balanceOf(accountAddress, certId).call();
    
                    if (balance > 0) {
                        balances.push({
                            certId: Number(certId),
                            energyInWh: Number(balance)
                        });
                    }
                }

                validContract = true;
            } catch (e) {
                console.error(e);
                console.log('Not a valid Contract');
            }
        }

        this.setState({
            registryContractAddress,
            balances,
            validAddress,
            validContract,
            errorMsg: null
        });
    }
    
    async onContractAddressChange(event: any) {
        event.persist();
        this.getData(event.target.value);
    }

    render() {
        const { balances, validAddress, validContract, errorMsg } = this.state;

        const isValidAddress = validAddress && this.props.accountAddress !== null && this.props.accountAddress !== '';
        const isValidContractAddress = validContract && this.state.registryContractAddress !== null && this.state.registryContractAddress !== '';

        return <div>

            <div className='row space'>
                <div className='col-md-4'>
                    <div className='text-muted'>Registry contract address</div>
                </div>
                <div className='col-md-8'>
                    <input 
                        type='text'
                        className='form-control text-center'
                        placeholder='Paste registry address'
                        onChange={this.onContractAddressChange}
                        defaultValue={this.state.registryContractAddress}
                    />
                </div>
            </div>

            <div className='row'>
                <div className='col text-center'>
                    {isValidAddress && isValidContractAddress && 
                        <>
                            {balances.length > 0 && 
                                <div>
                                    <div className='card space'>
                                        <div className='card-body'>
                                            <h6 className='card-subtitle text-muted'>
                                                {balances.map((balance, index) => <div key={index}>
                                                    {`Certificate #${balance.certId}: ${balance.energyInWh} Wh`}
                                                </div>)}
                                            </h6>
                                        </div>
                                    </div>
                                </div>
                            }
                            {balances.length == 0 && 
                                <div className='alert alert-warning space' role='alert'>
                                    This account has no Origin certificates.
                                </div>  
                            }
                        </>
                    }
                {!isValidAddress &&
                    <div className='alert alert-warning space' role='alert'>
                        Account address is not valid.
                    </div>  
                }
                {!isValidContractAddress &&
                    <div className='alert alert-warning space' role='alert'>
                        Registry address is not valid.
                    </div>  
                }
                {errorMsg &&
                    <div className='alert alert-danger space' role='alert'>
                        {errorMsg}
                    </div>  
                }
                </div>
            </div>
        </div>;
    }
}
