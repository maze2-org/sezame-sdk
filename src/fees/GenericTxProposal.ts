import { IFee } from './IFee';
import { Currency } from '../currencies';

export class GenericTxProposal implements IFee {
  currency = Currency.BTC;
  settings: any = {};
  getFeeValue() {
    return 0;
  }
  getData() {
    return {};
  }
}
