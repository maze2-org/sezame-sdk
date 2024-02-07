import { GenericBalanceDriver } from '../GenericBalanceDriver';
import { Client } from '../../utils/alephium/api/client';
import { GenericBalance } from '../GenericBalance';
import BigNumber from 'bignumber.js';
import { ALPH_UNIT } from '../../constants';

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
}
