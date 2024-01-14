import BigNumber from 'bignumber.js';
import { Client } from '../../utils/alephium/api/client';
import { GenericTransactionDriver } from '../GenericTransactionDriver';
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer';
import { ALPH_UNIT } from '../../constants';
import { GenericTxProposal } from '../../fees/GenericTxProposal';
import { transactionSign } from '@alephium/web3';

type AlphConfig = any;

export class ALPH_Driver extends GenericTransactionDriver {
  config: AlphConfig;

  createClient = async () => {
    return new Client({
      explorerApiHost: this.config.explorer,
      explorerUrl: this.config.explorer_url,
      networkId: this.config.network_id,
      nodeHost: this.config.node,
    })
  };

  getAddressGroup = async (address: string) => {
    const client = await this.createClient();
    return (await client.node.addresses.getAddressesAddressGroup(address)).group;
  }

  getTransactionsUrl = (address: string) => {
    return this.config.explorer_url
      ? this.config.explorer_url.replace('{address}', address)
      : '';
  };

  getTransactionStatus = async (
    _address: string,
    txId: string
  ): Promise<'pending' | 'success' | 'failed' | null> => {
    const client = await this.createClient();
    const status = await client.node.transactions.getTransactionsStatus({ txId })

    if (status?.type) {
      switch (status.type.toLocaleLowerCase()) {
        case 'confirmed':
          return 'success';
        case 'refused':
          return 'failed';
        default:
          return 'pending';
      }
    }
    return null;
  };

  getTransactions = async (address: string): Promise<any[]> => {
    const client = await this.createClient();

    return new Promise((resolve, reject) => {
      client.explorer.addresses.getAddressesAddressTransactions(address)
        .then(txs => {

          const history = txs.map(tx => {
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
            }
          });

          resolve(history);
        })
        .catch(err => {
          console.error(err);
          reject(err);
        });
    });
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
    } else {
      return 'Mining Rewards';
    }
  };

  send = async (transaction: GenericTxProposal): Promise<string> => {
    const client = await this.createClient();

    if (!this.assetConfig.privKey || !this.assetConfig.pubKey) {
      throw new Error('No key pair defined to sign the transaction');
    }
    const data: any = transaction.getData();
    const amount = BigInt(Number(data.proposal.valueToSend) * ALPH_UNIT);
    const txData = {
      fromPublicKey: this.assetConfig.pubKey,
      destinations: [
        {
          address: transaction.settings?.proposal?.to,
          attoAlphAmount: amount.toString(),
          tokens: [],
        }
      ],
    };

    const postedTx = await client.node.transactions.postTransactionsBuild(txData)
    const signature = transactionSign(postedTx.txId, this.assetConfig.privKey)
    const signedTx = await client.node.transactions.postTransactionsSubmit({ unsignedTx: postedTx.unsignedTx, signature })
    return signedTx.txId;
  };
}
