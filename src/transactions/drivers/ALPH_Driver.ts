import { GenericTransactionDriver } from '../GenericTransactionDriver';
import { GenericTxProposal } from '../../fees/GenericTxProposal';
import { ALPH_UNIT } from '../../constants';
import { CliqueClient } from 'alephium-js';

type FetchResponse = {
  error: any;
};

export class ALPH_Driver extends GenericTransactionDriver {
  createClient = async () => {
    return new CliqueClient({
      baseUrl: this.getEndpoint(),
    });
  };

  send = async (transaction: GenericTxProposal): Promise<string> => {
    const data: any = transaction.getData();
    const amount = BigInt(Number(data.proposal.valueToSend) * ALPH_UNIT);
    const cliqueClient = await this.createClient();
    await cliqueClient.init(false);

    if (!this.assetConfig.privKey) {
      throw new Error('No private key defined to sign the transaction');
    }

    if (!this.assetConfig.walletAddress) {
      throw new Error('Origin address was not defined');
    }

    try {
      const txCreateResp = await cliqueClient.transactionCreate(
        this.assetConfig.walletAddress || '',
        this.assetConfig.pubKey || '',
        data.proposal.to,
        amount.toString(),
        undefined
      );

      const { txId, unsignedTx } = txCreateResp.data;

      const signature = await cliqueClient.transactionSign(
        txId,
        this.assetConfig.privKey
      );

      const txSendResp = await cliqueClient.transactionSend(
        this.assetConfig.walletAddress,
        unsignedTx,
        signature
      );

      return txSendResp.data.txId;
    } catch (err) {
      const error = err as FetchResponse;
      if (error.error && error.error.detail) {
        throw new Error(error.error.detail);
      }
      throw new Error('Unkown error while creating transaction');
    }
  };

  getEndpoint() {
    const endpoint = this.config.endpoint;

    if (endpoint) {
      return endpoint;
    }
    throw new Error(
      this.currency + ' Transaction endpoint is required in config'
    );
  }
}
