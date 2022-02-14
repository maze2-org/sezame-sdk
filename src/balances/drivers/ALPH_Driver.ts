import { GenericBalanceDriver } from '../GenericBalanceDriver';

export class ALPH_Driver extends GenericBalanceDriver {
  config: any;
  getBalance = async (/* address: string */) => {
    this.getBalanceEndpoint();
    throw new Error('Unable to retrieve balance!');
  };

  getBalanceEndpoint() {
    let endpoints = [];
    if (this.config.endpoint) {
      if (!Array.isArray(this.config.endpoint)) {
        endpoints = [this.config.endpoint];
      } else {
        endpoints = this.config.endpoint;
      }
      return endpoints;
    }
    throw new Error(
      this.currency + ' Balance currency endpoint is required in config'
    );
  }
}
