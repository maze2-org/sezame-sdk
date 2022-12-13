import { GenericTransactionDriver } from '../GenericTransactionDriver';
import { GenericTxProposal } from '../../fees/GenericTxProposal';
import { ALPH_UNIT } from '../../constants';
import { CliqueClient, ExplorerClient } from '@alephium/sdk';
import { Transaction } from '@alephium/sdk/api/explorer';
import BigNumber from 'bignumber.js';

type FetchResponse = {
  error: any;
};

export class ALPH_Driver extends GenericTransactionDriver {
  createClient = async () => {
    const cliqueClient = new CliqueClient({
      baseUrl: this.config.node,
    });

    const explorerClient = new ExplorerClient({
      baseUrl: this.config.explorer,
    });

    await cliqueClient.init(false);

    return {
      clique: cliqueClient,
      explorer: explorerClient,
    };
  };

  getTransactionsUrl = (address: string) => {
    return this.config.explorer_url
      ? this.config.explorer_url.replace('{address}', address)
      : '';
  };

  calAmountDelta = (t: Transaction, id: string): BigNumber => {
    if (t.inputs && t.outputs) {
      const inputAmount = t.inputs.reduce<bigint>((acc, input) => {
        return input.attoAlphAmount && input.address === id
          ? acc + BigInt(input.attoAlphAmount)
          : acc;
      }, BigInt('0'));
      const outputAmount = t.outputs.reduce<bigint>((acc, output) => {
        return output.address === id
          ? acc + BigInt(output.attoAlphAmount)
          : acc;
      }, BigInt('0'));

      return new BigNumber(`${outputAmount - inputAmount}`);
    } else {
      throw 'Missing transaction details';
    }
  };

  renderIOAccountList = (currentAddress: string, io: any[] | undefined) => {
    if (io && io.length > 0) {
      const filtered = io
        .filter(o => o.address !== currentAddress)
        .map((v: any) => v.address)
        .filter((value, index, self) => {
          return self.indexOf(value) === index;
        });

      return filtered;
      // return _(io.filter(o => o.address !== currentAddress))
      //   .map((v: any) => v.address)
      //   .uniq()
      //   .value()
      //   .map((v: any) => v);
      // console.log(currentAddress);
      // return io;
    } else {
      return 'Mining Rewards';
    }
  };

  getTransactionStatus = async (
    address: string,
    txId: string
  ): Promise<'pending' | 'success' | 'failed' | null> => {
    const client = await this.createClient();
    const addressTransactionsResp = await client.explorer.getAddressTransactions(
      address,
      1
    );

    for (const row of addressTransactionsResp.data as any) {
      if (row.hash === txId) {
        switch (row.type) {
          case 'confirmed':
            return 'success';
          case 'refused':
            return 'failed';
          default:
            return 'pending';
        }
      }
    }

    return null;
  };

  getTransactions = async (address: string): Promise<any[]> => {
    const client = await this.createClient();

    return new Promise((resolve, reject) => {
      client.explorer
        .getAddressTransactions(address, 1)
        .then(txs => {
          const history = txs.data.map(tx => {
            const amountDelta = this.calAmountDelta(tx, address);
            const isOut = amountDelta < new BigNumber('0');
            const IOAddressesList = isOut ? tx.outputs : tx.inputs;
            const to = isOut
              ? this.renderIOAccountList(address, IOAddressesList)
              : address;
            const from = isOut
              ? address
              : this.renderIOAccountList(address, IOAddressesList);

            return {
              out: isOut,
              date: new Date(tx.timestamp),
              timestamp: tx.timestamp,
              hash: `${tx.hash}`,
              from,
              to,
              amount: amountDelta.dividedBy(ALPH_UNIT).toString(),
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

  send = async (transaction: GenericTxProposal): Promise<string> => {
    const data: any = transaction.getData();
    const amount = BigInt(Number(data.proposal.valueToSend) * ALPH_UNIT);
    const cliqueClient = await this.createClient();

    if (!this.assetConfig.privKey) {
      throw new Error('No private key defined to sign the transaction');
    }

    if (!this.assetConfig.walletAddress) {
      throw new Error('Origin address was not defined');
    }

    try {
      const txCreateResp = await cliqueClient.clique.transactionCreate(
        this.assetConfig.walletAddress || '',
        this.assetConfig.pubKey || '',
        data.proposal.to,
        amount.toString(),
        undefined
      );

      const { txId, unsignedTx } = txCreateResp.data;

      const signature = await cliqueClient.clique.transactionSign(
        txId,
        this.assetConfig.privKey
      );

      const txSendResp = await cliqueClient.clique.transactionSend(
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
