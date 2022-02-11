import { GenericTxProposal } from '../GenericTxProposal';
import { Currency } from '../../currencies';
import BigNumber from 'bignumber.js';
import { AVT_UNIT } from '../../constants';

export type AventusFeeProposal = {
  to: string;
  valueToSend: number;
};

export class AventusFee extends GenericTxProposal {
  currency = Currency.AVT;
  settings: {
    value: number;
    proposal: AventusFeeProposal;
  } = {
    value: 0,
    proposal: {
      to: '',
      valueToSend: 0,
    },
  };
  constructor(settings: any) {
    super();
    this.settings = settings;
  }
  getFeeValue() {
    return new BigNumber(this.settings.value)
      .dividedBy(new BigNumber(AVT_UNIT))
      .toNumber();
    //
  }
  getData() {
    return this.settings;
  }
}
