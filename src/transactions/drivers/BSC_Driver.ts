import axios from 'axios';
import { WEB3_Driver } from './WEB3_Driver';
import { BNB_UNIT } from '../../constants';
import BigNumber from 'bignumber.js';

export class BSC_Driver extends WEB3_Driver {
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
          switch (result.data.result?.status) {
            case '0':
              resolve('failed');
              break;
            case '1':
              resolve('success');
              break;
            default:
              resolve('pending');
          }
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
              .dividedBy(BNB_UNIT)
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
