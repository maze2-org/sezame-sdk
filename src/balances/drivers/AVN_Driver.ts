import { GenericBalanceDriver } from '../GenericBalanceDriver';
// import BigNumber from 'bignumber.js';
// import { GenericBalance } from '..';
// import { AVT_UNIT } from '../../constants';
// const AvnApi = require('avn-api');
export class AVN_Driver extends GenericBalanceDriver {
  config: any;
  definePrivateKey = (privateKey: string) => {
    process.env.SURI = privateKey;
  };

  // The getBalance is deactivated for aventus until their api is complete

  // getBalance = async (address: string) => {
  //   const api = new AvnApi(this.getBalanceEndpoint()[0]);

  //   try {
  //     await api.init();
  //     const balance = await api.query.getAvtBalance(address);
  //     return new GenericBalance(
  //       this.currency,
  //       new BigNumber(balance).dividedBy(AVT_UNIT).toNumber(),
  //       0
  //     );
  //   } catch (err) {
  //     console.error(err);
  //     throw new Error(
  //       `Unable to retrieve the ${this.currency} balance: ${err}`
  //     );
  //   }
  // };

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
