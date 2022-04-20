import { IWalletConfig } from '..';
import { GenericTxProposal } from '../fees/GenericTxProposal';

export class GenericTransactionDriver {
  currency: string;
  assetConfig: IWalletConfig;
  config: any;
  constructor(assetConfig: any, config?: any) {
    this.config = config;
    this.assetConfig = assetConfig;
    this.currency = assetConfig.symbol;
  }

  /**
   *
   * @returns Emtpy array if the specific driver does not handle transaction history
   */
  getTransactions = async (_address: string): Promise<any[]> => {
    console.log('getTransactions is not implemented for this blockchain');
    return [];
  };

  /**
   *
   * @returns Emtpy array if the specific driver does not handle transaction history
   */
  getTransactionStatus = async (
    _address: string,
    _txId: string
  ): Promise<'pending' | 'success' | 'failed' | null> => {
    console.log('getTransactionStatus is not implemented for this blockchain');
    return null;
  };

  /**
   *
   * @returns The transactions url
   */
  getTransactionsUrl = (_address: string): string => {
    return '';
  };

  send = async (_transaction: GenericTxProposal): Promise<any> => {
    return null;
  };

  stake = async (_transaction: GenericTxProposal): Promise<any> => {
    console.log('Staking not implemented on this blockchain');
    return null;
  };

  unstake = async (_transaction: GenericTxProposal): Promise<any> => {
    console.log('Unstaking not implemented on this blockchain');
    return null;
  };

  sendRaw = async (_transaction: any): Promise<any> => {
    return null;
  };
}
