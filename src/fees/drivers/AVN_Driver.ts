import { IFeeMap, FEE_TYPES } from '../IFee';
import { GenericDriver } from '../GenericDriver';
import { TransactionConfig } from 'web3-core';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { TRANSFER_METHOD_ABI } from '../../constants';
import { AventusFee } from '../types/AventusFee';

export class AVN_Driver extends GenericDriver {
  nativeAssetSymbol: string = 'AVT';

  buildFee = (proposal: any) => {
    return new AventusFee(proposal);
  };

  getTxSendProposals = async (destination: string, valueToSend: number) => {
    let fees: IFeeMap = {};

    fees[FEE_TYPES.REGULAR] = this.buildFee({
      value: 0,
      proposal: {
        to: destination,
        valueToSend,
      },
    });

    return fees;
  };

  buildProposal = async (body: any) => {
    const provider = new Web3.providers.HttpProvider(
      this.getProposalEndpoint()
    );

    const {
      fromPrivateKey,
      to,
      amount,
      currency,
      fee,
      data,
      nonce,
      signatureId,
    } = body;

    const client = new Web3(provider);
    client.eth.accounts.wallet.add(fromPrivateKey);
    client.eth.defaultAccount = client.eth.accounts.wallet[0].address;

    let tx: TransactionConfig;
    if (currency === this.nativeAssetSymbol) {
      tx = {
        from: 0,
        to: to.trim(),
        value: client.utils.toWei(`${amount}`, 'ether'),
        data: data
          ? client.utils.isHex(data)
            ? client.utils.stringToHex(data)
            : client.utils.toHex(data)
          : undefined,
        nonce,
      };
    } else {
      const contract = new client.eth.Contract(
        // @ts-ignore
        [TRANSFER_METHOD_ABI],
        this.assetConfig.contract
      );
      const digits = new BigNumber(10).pow(this.assetConfig.decimals!);
      tx = {
        from: 0,
        to: this.assetConfig.contract!,
        data: contract.methods
          .transfer(
            to.trim(),
            `0x${new BigNumber(amount).multipliedBy(digits).toString(16)}`
          )
          .encodeABI(),
        nonce,
      };
    }

    const gasPrice = client.utils.toWei(fee.gasPrice, 'gwei');
    tx = {
      ...tx,
      gasPrice,
    };

    if (!signatureId) {
      tx.gas = fee?.gasLimit ?? (await client.eth.estimateGas(tx));
    }

    return {
      signatureId: signatureId,
      fromPrivateKey: fromPrivateKey,
      fee: {
        gasLimit: tx.gas,
        gasPrice: fee.gasPrice,
      },
      proposal: signatureId ? JSON.stringify(tx) : tx,
    };
  };

  getProposalEndpoint() {
    const endpoint = this.config.proposal_endpoint;
    if (endpoint) {
      return endpoint;
    }
    throw new Error(this.currency + ' Balance currency is required in config');
  }
}
