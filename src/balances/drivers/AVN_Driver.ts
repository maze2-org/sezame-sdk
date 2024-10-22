import { GenericBalanceDriver } from '../GenericBalanceDriver';
import BigNumber from 'bignumber.js';
import { GenericBalance } from '..';
import { AVT_UNIT } from '../../constants';
const { AvnApi, SetupMode, SigningMode } = require("avn-api");
export class AVN_Driver extends GenericBalanceDriver {
  config: any;
  definePrivateKey = (privateKey: string) => {
    process.env.SURI = privateKey;
  };

  getBalance = async (address: string) => {
    const singleUserOptions = {
      suri: process.env.SURI, 
      setupMode: SetupMode.SingleUser,
      signingMode: SigningMode.SuriBased,
    };
    const avnSdk = new AvnApi(this.getBalanceEndpoint()[0], singleUserOptions);

    try {
      await avnSdk.init();
      const api = await avnSdk.apis();
      
      // const balance = await api.query.getAvtBalance(address);
      const balance = await api.query.getAccountInfo(address);

      return new GenericBalance(
        this.currency,
        new BigNumber(balance.totalBalance).dividedBy(AVT_UNIT).toNumber(),
        0,
        new BigNumber(balance.stakedBalance).dividedBy(AVT_UNIT).toNumber(),
        new BigNumber(balance.unlockedBalance).dividedBy(AVT_UNIT).toNumber(),
        new BigNumber(balance.unstakedBalance).dividedBy(AVT_UNIT).toNumber(),
        new BigNumber(balance.freeBalance).dividedBy(AVT_UNIT).toNumber()
      );
    } catch (err) {
      console.error(err);
      throw new Error(
        `Unable to retrieve the ${this.currency} balance: ${err}`
      );
    }
  };

  getBalanceEndpoint() {
    let endpoints = [];
    if (this.config.avn_gateway_endpoint) {
      if (!Array.isArray(this.config.avn_gateway_endpoint)) {
        endpoints = [this.config.avn_gateway_endpoint];
      } else {
        endpoints = this.config.avn_gateway_endpoint;
      }
      return endpoints;
    }
    throw new Error(
      this.currency + ' Balance currency endpoint is required in config'
    );
  }
}
