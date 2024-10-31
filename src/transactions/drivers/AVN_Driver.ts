import { GenericTransactionDriver } from '../GenericTransactionDriver';
import { GenericTxProposal } from '../../fees/GenericTxProposal';
// import { AVT_UNIT } from '../../constants';
// import BigNumber from 'bignumber.js';
// import axios from 'axios';
import BigNumber from 'bignumber.js';
import { AVT_UNIT } from '../../constants';
import { StakingProperties } from '../../wallets/types/StakingProperties';

const { AvnApi, SetupMode, SigningMode } = require('avn-api');

export class AVN_Driver extends GenericTransactionDriver {
  initApi = async () => {
    const singleUserOptions = {
      suri: process.env.SURI,
      setupMode: SetupMode.SingleUser,
      signingMode: SigningMode.SuriBased,
    };
    const avnSdk = new AvnApi(this.getEndpoint(), singleUserOptions);
    await avnSdk.init();
    const api = await avnSdk.apis();
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

  stake = async (transaction: GenericTxProposal): Promise<string> => {
    const data: any = transaction.getData();
    const api = await this.initApi();

    const amountToStake = new BigNumber(data.proposal.valueToSend)
      .multipliedBy(AVT_UNIT)
      .toString();

    const requestId = await api.send.stake(
      this.config.avn_relayer,
      amountToStake
    );

    return requestId;
  };

  unstake = async (transaction: GenericTxProposal): Promise<string> => {
    const data: any = transaction.getData();
    const api = await this.initApi();

    const amountToStake = new BigNumber(data.proposal.valueToSend)
      .multipliedBy(AVT_UNIT)
      .toString();

    const requestId = await api.send.unstake(
      this.config.avn_relayer,
      amountToStake
    );
    return requestId;
  };

  withdrawUnlocked = async (): Promise<string> => {
    const api = await this.initApi();

    const requestId = await api.send.withdrawUnlocked(this.config.avn_relayer);
    return requestId;
  };

  swap = async (
    transaction: GenericTxProposal,
    swapType: 'lifting' | 'lowering' | 'swaping'
  ): Promise<string> => {
    const data: any = transaction.getData();
    const api = await this.initApi();

    switch (swapType) {
      case 'lifting':
        const ethereumTransactionHashForLift = data.proposal.to;
        return await api.send.confirmTokenLift(
          this.config.avn_relayer,
          ethereumTransactionHashForLift
        );
      case 'lowering':
        const recipient = data.proposal.to;
        const lowerAmount = new BigNumber(data.proposal.valueToSend)
          .multipliedBy(AVT_UNIT)
          .toString();
        return await api.send.lowerToken(
          this.config.avn_relayer,
          recipient,
          this.config.token_address,
          lowerAmount
        );
      default:
        throw new Error(`The ${swapType} is not supported by this blockchain`);
    }
  };

  getStakingProperties = async (
    address: string
  ): Promise<StakingProperties> => {
    const api = await this.initApi();
    const stats = await api.query.getStakingStats();
    const status = await api.query.getStakingStatus(address);
    const properties: StakingProperties = {
      minStaking:
        status !== 'isStaking'
          ? parseFloat(
              new BigNumber(stats.minUserBond).dividedBy(AVT_UNIT).toString()
            )
          : 0.1,

      maxStaking: null,
    };

    return properties;
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
      const result = await api.poll.requestState(txId);

      switch (result.status) {
        case 'Processed':
          return 'success';
        case 'Errored':
        case 'Rejected':
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
