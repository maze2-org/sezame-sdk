import { GenericBalanceDriver } from '../GenericBalanceDriver';
import { Client } from '../../utils/alephium/api/client';
import { GenericBalance } from '../GenericBalance';
import BigNumber from 'bignumber.js';
import { ALPH_UNIT } from '../../constants';
// import BigNumber from 'bignumber.js';

export class ALPH_Driver extends GenericBalanceDriver {
  config: any;

  createClient = async () => {
    return new Client({
      explorerApiHost: this.config.explorer,
      explorerUrl: this.config.explorer_url,
      networkId: this.config.network_id,
      nodeHost: this.config.node,
    })
  };

  getBalance = async (address: string) => {
    const client = await this.createClient();

    const balance = new BigNumber((await client.node.addresses.getAddressesAddressBalance(address)).balance)
      .dividedBy(ALPH_UNIT)
      .toNumber();

    return new GenericBalance(
      this.currency,
      balance,
      0,
      0,
      0,
      0,
      balance
    );
  }

  // getGroup = async (address: string) => {
  //   const client = await this.createClient();
  //   return (await client.node.addresses.getAddressesAddressGroup(address)).group;
  // }

  // getBalance = async (address: string) => {
  //   const cliqueClient = await this.createClient();
  //   const addressDetailsResp = await cliqueClient.getAddressDetails(address);

  //   return new GenericBalance(
  //     this.currency,
  //     new BigNumber(addressDetailsResp.data.balance)
  //       .dividedBy(ALPH_UNIT)
  //       .toNumber(),
  //     0,
  //     0,
  //     0,
  //     0,
  //     new BigNumber(addressDetailsResp.data.balance)
  //       .dividedBy(ALPH_UNIT)
  //       .toNumber()
  //   );
  // };

  // getBalanceEndpoint() {
  //   let endpoints = [];
  //   if (this.config.explorer) {
  //     if (!Array.isArray(this.config.explorer)) {
  //       endpoints = [this.config.explorer];
  //     } else {
  //       endpoints = this.config.explorer;
  //     }
  //     return endpoints;
  //   }
  //   throw new Error(
  //     this.currency + ' Balance currency endpoint is required in config'
  //   );
  // }
}
