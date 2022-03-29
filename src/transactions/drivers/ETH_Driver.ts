import axios from 'axios';
import BigNumber from 'bignumber.js';
import { ETH_UNIT } from '../../constants';
import { WEB3_Driver } from './WEB3_Driver';

export class ETH_Driver extends WEB3_Driver {
  getTransactionsUrl = (address: string) => {
    return this.config.explorer_url
      ? this.config.explorer_url.replace('{address}', address)
      : '';
  };

  getTransactionStatus = async (
    _address: string,
    txId: string
  ): Promise<'pending' | 'success' | 'failed' | null> => {
    const apiUrl = this.config.transaction_status.replace('{txHash}', txId);

    return new Promise((resolve, reject) => {
      axios
        .get(apiUrl, {
          headers: {
            Accept: 'application/json',
          },
        })
        .then(result => {
          console.log(
            'GOT RESULT FOR TRANSACTION STATUS',
            apiUrl,
            `'${result.data.result?.status}'`
          );
          resolve(result.data.result?.status === '1' ? 'success' : 'pending');
        })
        .catch(err => {
          console.error(err);
          reject(null);
        });
    });
  };

  getTransactions = async (address: string): Promise<any[]> => {
    const apiUrl = this.config.api_transction_url.replace('{address}', address);

    return new Promise((resolve, reject) => {
      axios
        .get(apiUrl, {
          headers: {
            Accept: 'application/json',
          },
        })
        .then(result => {
          const hits = result?.data?.result ? result.data.result : [];

          const history = hits.map((hit: any) => {
            const isOut = hit.from === 'address';
            const value = new BigNumber(hit.value)
              .dividedBy(ETH_UNIT)
              .toString();

            return {
              date: new Date(hit.timeStamp * 1000),
              out: isOut,
              timestamp: hit.timeStamp * 1000,
              hash: hit.hash,
              from: [hit.from],
              to: [hit.to],
              amount: isOut ? '-' + value : value,
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
}
