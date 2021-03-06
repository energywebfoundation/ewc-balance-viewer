import * as React from 'react';
import { ORIGIN_ISSUER_ABI } from '../abi/OriginIssuerABI';
import { ORIGIN_REGISTRY_ABI } from '../abi/OriginRegistryABI';
import { Network, NetworkProperties } from '../Settings';

interface OriginCertificatesBalanceProps {
    network: Network,
    web3: any,
    accountAddress: string
}

interface Certificate {
    certId: number,
    generationStartTime: Date,
    generationEndTime: Date,
    deviceId: string,
    ownedEnergy: number,
    claimedEnergy: number
}

interface OriginCertificatesBalanceState {
    registryContractAddress: string,
    balances: Certificate[],
    selectedCertificate: Certificate,
    sendAmount: number,
    sendToAddress: string,
    validAddress: boolean,
    validContract: boolean,
    errorMsg: string
}

export class OriginCertificatesBalance extends React.Component<OriginCertificatesBalanceProps, OriginCertificatesBalanceState> {

    constructor(props: any) {
        super(props);

        this.state = {
            registryContractAddress: NetworkProperties[props.network].contracts.originRegistry,
            balances: [],
            selectedCertificate: null,
            sendAmount: null,
            sendToAddress: null,
            validAddress: false,
            validContract: false,
            errorMsg: null
        };

        this.onContractAddressChange = this.onContractAddressChange.bind(this);
        this.setSelectedCertificate = this.setSelectedCertificate.bind(this);
        this.setSendAmount = this.setSendAmount.bind(this);
        this.setSendToAddress = this.setSendToAddress.bind(this);
        this.transfer = this.transfer.bind(this);
        this.claim = this.claim.bind(this);
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
            const registryContract = new web3.eth.Contract(ORIGIN_REGISTRY_ABI as any, registryContractAddress);
            try {
                const certificateIds = await registryContract.methods.allCertificateIds().call({ from: accountAddress });

                for (const certId of certificateIds) {
                    const balance = await registryContract.methods.balanceOf(accountAddress, certId).call();
                    const claimedBalance = await registryContract.methods.claimedBalanceOf(accountAddress, certId).call();

                    const { issuer: issuerContractAddress, data } = await registryContract.methods.getCertificate(certId).call();

                    const issuerContract = new web3.eth.Contract(ORIGIN_ISSUER_ABI as any, issuerContractAddress);
                    const { 0: generationStartTimestamp, 1: generationEndTimestamp, 2: deviceId} = await issuerContract.methods.decodeData(data).call();
    
                    if (balance > 0 || claimedBalance > 0) {
                        balances.push({
                            certId: Number(certId),
                            generationStartTime: new Date(generationStartTimestamp * 1000),
                            generationEndTime: new Date(generationEndTimestamp * 1000),
                            deviceId,
                            ownedEnergy: Number(balance),
                            claimedEnergy: Number(claimedBalance),
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

    async setSelectedCertificate(cert: Certificate) {
        this.setState({
            selectedCertificate: cert,
            sendAmount: cert.ownedEnergy / 1e9
        });
    }

    async setSendAmount(event: any) {
        event.persist();
        this.setState({ sendAmount: Number(event.target.value) });
    }

    async setSendToAddress(event: any) {
        event.persist();
        this.setState({ sendToAddress: event.target.value});
    }

    async transfer() {
        const { web3, accountAddress } = this.props;
        const { registryContractAddress, sendToAddress, sendAmount, selectedCertificate } = this.state;

        const registryContract = new web3.eth.Contract(ORIGIN_REGISTRY_ABI as any, registryContractAddress);

        await registryContract.methods.safeTransferFrom(
            accountAddress,
            sendToAddress,
            selectedCertificate.certId,
            sendAmount * 1e9,
            ['0x0']
        ).send({ from: accountAddress });
    }

    async claim() {
        const { web3, accountAddress } = this.props;
        const { registryContractAddress, selectedCertificate } = this.state;

        const registryContract = new web3.eth.Contract(ORIGIN_REGISTRY_ABI as any, registryContractAddress);

        await registryContract.methods.safeTransferAndClaimFrom(
            accountAddress,
            accountAddress,
            selectedCertificate.certId,
            (selectedCertificate.ownedEnergy).toLocaleString('fullwide', { useGrouping: false }),
            ['0x0'],
            ['0x0']
        ).send({ from: accountAddress });
    }

    render() {
        const {
            balances,
            validAddress,
            validContract,
            errorMsg,
            sendAmount,
            sendToAddress,
            registryContractAddress
        } = this.state;

        const isValidAddress = validAddress && this.props.accountAddress !== null && this.props.accountAddress !== '';
        const isValidContractAddress = validContract && registryContractAddress !== null && registryContractAddress !== '';

        const fullyClaimed = balances.filter(cert => cert.claimedEnergy > 0 && cert.ownedEnergy === 0);
        const unclaimed = balances.filter(cert => cert.ownedEnergy > 0);

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
                                    <h5 className="mt-5">Owned Certificates</h5>
                                    <div className='card space'>
                                        <div className='card-body'>
                                            <h6 className='card-subtitle text-muted'>
                                                {unclaimed.map((certificate, index) => <div className="row my-2" key={index}>
                                                    <div className='col-9'>
                                                        <div className="row p-2">
                                                            <div className="col-4 text-left font-weight-bold">
                                                                Device ID
                                                            </div>
                                                            <div className="col-8">
                                                                {certificate.deviceId}
                                                            </div>
                                                        </div>
                                                        <div className="row p-2">
                                                            <div className="col-4 text-left font-weight-bold">
                                                                Certificate ID
                                                            </div>
                                                            <div className="col-8">
                                                                {`#${certificate.certId}`}
                                                            </div>
                                                        </div>
                                                        <div className="row p-2">
                                                            <div className="col-4 text-left font-weight-bold">
                                                                Generation Time
                                                            </div>
                                                            <div className="col-8">
                                                                {certificate.generationStartTime.toLocaleDateString()} to {certificate.generationEndTime.toLocaleDateString()}
                                                            </div>
                                                        </div>

                                                        {certificate.ownedEnergy > 0 && 
                                                            <div className="row p-2">
                                                                <div className="col-4 text-left font-weight-bold">
                                                                Energy owned
                                                                </div>
                                                                <div className="col-8">
                                                                    {certificate.ownedEnergy / 1e9} MWh
                                                                </div>
                                                            </div>
                                                        }

                                                        {certificate.claimedEnergy > 0 && 
                                                            <div className="row p-2">
                                                                <div className="col-4 text-left font-weight-bold">
                                                                Energy claimed
                                                                </div>
                                                                <div className="col-8">
                                                                    {certificate.claimedEnergy / 1e9} MWh
                                                                </div>
                                                            </div>
                                                        }

                                                        <hr />
                                                    </div>
                                                    <div className='col-3'>
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary btn-sm"
                                                            data-toggle="modal"
                                                            data-target="#sendModal"
                                                            onClick={() => this.setSelectedCertificate(certificate)}
                                                        >
                                                            Send
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary btn-sm ml-2"
                                                            data-toggle="modal"
                                                            data-target="#claimModal"
                                                            onClick={() => this.setSelectedCertificate(certificate)}
                                                        >
                                                            Claim
                                                        </button>
                                                    </div>
                                                </div>)}
                                            </h6>
                                        </div>
                                    </div>

                                    <h5 className="mt-5">Claimed Certificates</h5>
                                    <div className='card space'>
                                        <div className='card-body'>
                                            <h6 className='card-subtitle text-muted'>
                                                {fullyClaimed
                                                    .map((certificate, index) => 
                                                        <div className="container my-2" key={index}>
                                                            <div className="row p-2">
                                                                <div className="col-4 text-left font-weight-bold">
                                                                    Device ID
                                                                </div>
                                                                <div className="col-8">
                                                                    {certificate.deviceId}
                                                                </div>
                                                            </div>
                                                            <div className="row p-2">
                                                                <div className="col-4 text-left font-weight-bold">
                                                                    Certificate ID
                                                                </div>
                                                                <div className="col-8">
                                                                    {`#${certificate.certId}`}
                                                                </div>
                                                            </div>
                                                            <div className="row p-2">
                                                                <div className="col-4 text-left font-weight-bold">
                                                                    Generation Time
                                                                </div>
                                                                <div className="col-8">
                                                                    {certificate.generationStartTime.toLocaleDateString()} to {certificate.generationEndTime.toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                            <div className="row p-2">
                                                                <div className="col-4 text-left font-weight-bold">
                                                                Energy claimed
                                                                </div>
                                                                <div className="col-8">
                                                                    {certificate.claimedEnergy / 1e9} MWh
                                                                </div>
                                                            </div>

                                                            <hr />
                                                        </div>)
                                                }
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

            <div
                className="modal fade"
                id="sendModal"
                tabIndex={-1}
                role="dialog"
                aria-labelledby="sendModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="sendModalLabel">Send Certificate</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-4">
                                    <div className="input-group mb-3">
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Amount of MWh"
                                            aria-label="Amount of MWh"
                                            value={sendAmount || ''}
                                            onChange={this.setSendAmount}
                                            aria-describedby="send-amount"
                                        />
                                        <div className="input-group-append">
                                            <span className="input-group-text" id="send-amount">MWh</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-1">to</div>

                                <div className="col-7">
                                    <input 
                                        type='text'
                                        className='form-control text-center'
                                        placeholder='Destination address'
                                        value={sendToAddress || ''}
                                        onChange={this.setSendToAddress}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={this.transfer}>Send</button>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="modal fade"
                id="claimModal"
                tabIndex={-1}
                role="dialog"
                aria-labelledby="claimModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="claimModalLabel">Claim Certificate</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to claim certificate with ID #{this.state.selectedCertificate?.certId} generated by device with ID {this.state.selectedCertificate?.deviceId}?
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={this.claim}>Claim</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}
