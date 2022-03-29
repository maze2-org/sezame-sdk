import { GenericTxProposal } from '../GenericTxProposal';
import { Currency } from '../../currencies';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { weiToETH } from '../../currencyFunctions';

export class EthereumFee extends GenericTxProposal {
  currency = Currency.ETH;
  settings: {
    signatureId: string | undefined;
    fromPrivateKey: string;
    fee: {
      gasLimit: number;
      gasPrice: number;
    };
    proposal: any;
    feeValue: number;
  } = {
    signatureId: undefined,
    fromPrivateKey: '',
    fee: {
      gasLimit: 0,
      gasPrice: 0,
    },
    proposal: '',
    feeValue: 0,
  };
  constructor(settings: any) {
    super();
    this.settings = settings;
    this.settings.feeValue = this.getFeeValue();
  }
  getFeeValue() {
    const gasToWei = Web3.utils.toWei(
      this.settings.fee.gasPrice.toString(),
      'Gwei'
    );
    const feeValue = new BigNumber(this.settings.fee.gasLimit)
      .multipliedBy(gasToWei)
      .toString();
    return Number(weiToETH(feeValue));
    //
  }
  getData() {
    return this.settings;
  }
}
