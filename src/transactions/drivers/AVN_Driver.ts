import { GenericTransactionDriver } from '../GenericTransactionDriver';
import { GenericTxProposal } from '../../fees/GenericTxProposal';
// import { AVT_UNIT } from '../../constants';
// import BigNumber from 'bignumber.js';
// import axios from 'axios';
import BigNumber from 'bignumber.js';
import { AVT_UNIT } from '../../constants';

const AvnApi = require('avn-api');

export class AVN_Driver extends GenericTransactionDriver {
  initApi = async () => {
    const api = new AvnApi(this.getEndpoint());
    await api.init();
    return api;
  };

  send = async (transaction: GenericTxProposal): Promise<string> => {
    const data: any = transaction.getData();
    const api = await this.initApi();

    const amount = new BigNumber(data.proposal.valueToSend)
      .multipliedBy(AVT_UNIT)
      .toString();

    const txId = await api.send.transferAvt(
      this.config.avn_relayer,
      data.proposal.to,
      `${amount}`
    );

    return txId;
  };

  getTransactionsUrl = (address: string) => {
    return this.config.explorer_url
      ? this.config.explorer_url.replace('{address}', address)
      : '';
  };

  getTransactionStatus = async (
    _address: string,
    txId: string
  ): Promise<'pending' | 'success' | 'failed' | null> => {
    try {
      const api = await this.initApi();
      const status = await api.poll.requestState(txId);

      switch (status) {
        case 'Processed':
          return 'success';
        case 'Errored':
        case 'Pending and Lost':
          return 'failed';
        default:
          return 'pending';
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Temporary desactivating the transaction retrieval for Aventus. API to retrieve tsx is not ready yet.

  // getTransactions = async (address: string): Promise<any[]> => {
  //   const api_url = this.config.api_transction_url;

  //   return new Promise((resolve, reject) => {
  //     axios
  //       .get(
  //         `${api_url}?size=20&from=0&sort=timestamp,desc&address=${address}`,
  //         {
  //           headers: {
  //             Accept: 'application/json',
  //           },
  //         }
  //       )
  //       .then(result => {
  //         const hits = result?.data?.data?.hits?.hits
  //           ? result.data.data.hits.hits
  //           : [];

  //         const history = hits.map((hit: any) => {
  //           const isOut = hit._source.transaction.from === address;

  //           return {
  //             date: new Date(hit._source.timestamp),
  //             out: isOut,
  //             timestamp: hit._source.timestamp,
  //             hash: hit._source.blockHash,
  //             from: [hit._source.transaction.from],
  //             to: [hit._source.transaction.to],
  //             amount:
  //               hit._source.transaction.from === address
  //                 ? '-' + hit._source.transaction.amountToken
  //                 : hit._source.transaction.amountToken,
  //           };
  //         });
  //         resolve(history);
  //       })
  //       .catch(err => {
  //         console.error(err);
  //         reject(err);
  //       });
  //   });
  // };

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
