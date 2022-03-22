import { GenericTransactionDriver } from '../GenericTransactionDriver';
import { GenericTxProposal } from '../../fees/GenericTxProposal';
import { AVT_UNIT } from '../../constants';
import BigNumber from 'bignumber.js';
import axios from 'axios';

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

  getTransactionsUrl = (address: string) => {
    return this.config.explorer_url
      ? this.config.explorer_url.replace('{address}', address)
      : '';
  };

  getTransactions = async (address: string): Promise<any[]> => {
    const api_url = this.config.api_transction_url;

    return new Promise((resolve, reject) => {
      axios
        .get(
          `${api_url}?size=20&from=0&sort=timestamp,desc&address=${address}`,
          {
            headers: {
              Accept: 'application/json',
            },
          }
        )
        .then(result => {
          const hits = result?.data?.data?.hits?.hits
            ? result.data.data.hits.hits
            : [];

          const history = hits.map((hit: any) => {
            return {
              date: new Date(hit._source.timestamp),
              timestamp: hit._source.timestamp,
              hash: hit._source.blockHash,
              from: hit._source.transaction.from,
              to: hit._source.transaction.to,
              amount: hit._source.transaction.amountToken,
            };
          });
          resolve(history);
        })
        .catch(err => {
          console.error(err);
          reject(err);
        });
    });
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
