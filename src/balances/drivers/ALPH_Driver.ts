import { GenericBalanceDriver } from '../GenericBalanceDriver';
import { Client } from '../../utils/alephium/api/client';
import { GenericBalance } from '../GenericBalance';
import BigNumber from 'bignumber.js';
import { ALPH_UNIT } from '../../constants';

type GetBalanceOptions = {
  tokenId: string | null,
  decimals: number
}

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

  getBalance = async (address: string, options?: GetBalanceOptions) => {
    const {tokenId, decimals} = options || {}
    const client = await this.createClient();
    const isNativeToken = tokenId === null
    const addressBalance = await client.node.addresses.getAddressesAddressBalance(address)
    const nativeTokenBalance = addressBalance.balance;
    const tokenBalance = addressBalance?.tokenBalances?.find(tokenBalance => tokenBalance.id === tokenId)?.amount || '0';
    const resultBalance = isNativeToken ? nativeTokenBalance : Number(tokenBalance);
    const resultDecimals = isNativeToken ? ALPH_UNIT : (decimals ? Math.pow(10, decimals) : ALPH_UNIT);

    const balance = new BigNumber(resultBalance).dividedBy(resultDecimals).toNumber();

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
