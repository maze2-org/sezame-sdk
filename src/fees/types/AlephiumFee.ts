import { GenericTxProposal } from '../GenericTxProposal';
import { Currency } from '../../currencies';
import BigNumber from 'bignumber.js';
import { ALPH_UNIT } from '../../constants';

export type AlephiumFeeProposal = {
  to: string;
  valueToSend: number;
};

export class AlephiumFee extends GenericTxProposal {
  currency = Currency.ALPH;
  settings: {
    value: number;
    proposal: AlephiumFeeProposal;
    feeValue: number;
  } = {
    value: 0,
    feeValue: 0,
    proposal: {
      to: '',
      valueToSend: 0,
    },
  };
  constructor(settings: any) {
    super();
    this.settings = settings;
    this.settings.feeValue = this.getFeeValue();
  }
  getFeeValue() {
    return new BigNumber(this.settings.value)
      .dividedBy(new BigNumber(ALPH_UNIT))
      .toNumber();
    //
  }
  getData() {
    return this.settings;
  }
}
