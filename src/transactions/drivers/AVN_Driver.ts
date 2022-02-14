import { GenericTransactionDriver } from '../GenericTransactionDriver';
import { GenericTxProposal } from '../../fees/GenericTxProposal';
import { AVT_UNIT } from '../../constants';
import BigNumber from 'bignumber.js';

const AvnApi = require('avn-api');

export class AVN_Driver extends GenericTransactionDriver {
  send = async (transaction: GenericTxProposal): Promise<string> => {
    const data: any = transaction.getData();
    const api = new AvnApi(this.getEndpoint());
    await api.init();

    const txId = await api.send.transferToken(
      this.config.avn_relayer,
      data.proposal.to,
      this.config.token_address,
      new BigNumber(data.proposal.valueToSend).multipliedBy(AVT_UNIT).toString()
    );
    return txId;
  };

  getEndpoint() {
    const endpoint = this.config.avn_gateway_endpoint;

    if (endpoint) {
      return endpoint;
    }
    throw new Error(
      this.currency + ' Transaction endpoint is required in config'
    );
  }
}
