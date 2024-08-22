import { NodeProvider } from '@alephium/web3';
import { Chains } from './chains';

import {
  AvnGenerator,
  BitcoinGenerator,
  BscGenerator,
  EthereumGenerator,
  PolygonGenerator,
  AlephiumGenerator,
} from './generators';

const DRIVER_NAMESPACE: {
  [key: string]: any;
} = {
  [Chains.BTC]: BitcoinGenerator,
  [Chains.ETH]: EthereumGenerator,
  [Chains.POLYGON]: PolygonGenerator,
  [Chains.BSC]: BscGenerator,
  [Chains.AVN]: AvnGenerator,
  [Chains.ALPH]: AlephiumGenerator,
};

/**
 *
 *
 * @export
 * @class NodeProviderGenerator
 */
export class NodeProviderGenerator {
  /**
   * Offers direct access to the drivers that offer the key generation.
   *
   * @static
   * @param {Chains} chain
   * @return {GenericGenerator}
   * @memberof WalletGenerator
   */
  static getDriver(chain: Chains) {
    let driver = DRIVER_NAMESPACE[chain];
    if (!driver) {
      throw new Error('Unsupported wallet chain');
    }
    return driver;
  }

  /**
   *
   * @param {string} chain The type of chain
   * @param {*} [config=CONFIG]
   * @returns {NodeProvider} Description of the wallet
   */
  static async getNodeProvider(chain: Chains): Promise<NodeProvider> {
    return await NodeProviderGenerator.getDriver(chain);
  }
}
