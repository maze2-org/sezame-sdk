import { Chains } from './chains';
import { CONFIG } from './utils/config';
import { generateMnemonic } from 'bip39';
import {
  AvnGenerator,
  BitcoinGenerator,
  BscGenerator,
  EthereumGenerator,
  PolygonGenerator,
  AlephiumGenerator,
} from './generators';
import { WalletDescription } from './utils/types/WalletDescription';

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
 * @class WalletGenerator
 */
export class WalletGenerator {
  /**
   * Generates a string containing the 12 words used as a mnemonic
   * to create the private and public wallet keys.
   *
   * @static
   * @param {number} [size=128] Or use 256 for 24 words
   * @return {string} The mnemonic
   * @memberof WalletGenerator
   */
  static generateMnemonic(size = 128): string {
    const mnemonic = generateMnemonic(size);
    return mnemonic;
  }

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
   * Generate the wallet's XPUB address.
   * The source of all addresses to be generated for the public.
   *
   * @static
   * @param {Chains} chain The type of chain
   * @param {string} mnemonic
   * @param {*} [config=CONFIG]
   * @return {string} The wallet's XPUB address
   * @memberof WalletGenerator
   */
  static async generateWalletXpub(
    chain: Chains,
    mnemonic: any,
    config: any = CONFIG
  ) {
    let driver = WalletGenerator.getDriver(chain);
    return driver.generateWalletXpub(mnemonic, config);
  }

  /**
   * Generate the wallet's private key.
   *
   * @static
   * @param {Chains} chain The type of chain
   * @param {string} mnemonic
   * @param {integer} derivation The derivation key to allow generation of more private keys for the same chain
   * @param {*} [config=CONFIG]
   * @return {string} The wallet's private key
   * @memberof WalletGenerator
   */
  static async generatePrivateKeyFromMnemonic(
    chain: Chains,
    mnemonic: any,
    derivation: any,
    group: number,
    usedIndexes: number[]
  ) {
    let driver = WalletGenerator.getDriver(chain);
    return driver.generatePrivateKeyFromMnemonic(
      mnemonic,
      derivation,
      CONFIG,
      group,
      usedIndexes
    );
  }

  /**
   * Generate the public wallet address for the specified chain
   *
   * @static
   * @param {Chains} chain The type of chain
   * @param {string} xpub
   * @param {integer} derivation
   * @param {*} [config=CONFIG]
   * @return {string} The wallet's public address
   * @memberof WalletGenerator
   */
  static async generateAddressFromXPub(
    chain: Chains,
    xpub: any,
    derivation: any,
    config: any = CONFIG
  ) {
    let driver = WalletGenerator.getDriver(chain);
    return driver.generateAddressFromXPub(xpub, derivation, config);
  }

  /**
   *
   * @param {string} mnemonic Seed phrase of the wallet
   * @param {string} chain The type of chain
   * @param {integer} derivation
   * @param {*} [config=CONFIG]
   * @returns {WalletDescription} Description of the wallet
   */
  static async generateKeyPairFromMnemonic(
    mnemonic: string,
    chain: Chains,
    derivation: any,
    usedIndexes?: number[],
    group?: number
  ): Promise<WalletDescription> {

    const driver = WalletGenerator.getDriver(chain);
    return driver.generateWalletFromMnemonic(
      mnemonic,
      derivation,
      CONFIG,
      usedIndexes,
      group
    );
  }
}
