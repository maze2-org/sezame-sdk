import { GenericGenerator } from '../GenericGenerator';

import { Keyring } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';
import { WalletDescription } from '../../utils/types/WalletDescription';
import { cryptoWaitReady, mnemonicToMiniSecret } from '@polkadot/util-crypto';
// import { CONFIG } from '../../utils/config';

/**
 *
 *
 * @export
 * @class AVNGenerator
 * @extends {GenericGenerator}
 */
export class AvnGenerator extends GenericGenerator {
  static async generateWalletXpub(mnemonic: any, accountCrypto: any) {
    let crypto = accountCrypto || 'sr25519';

    if (!['ed25519', 'sr25519'].includes(crypto)) {
      throw `Invalid account crypto "${crypto}" specified.`;
    }

    await cryptoWaitReady();

    const keyring = new Keyring({ type: crypto, ss58Format: 42 });

    const keyPair = keyring.createFromUri(mnemonic);
    return u8aToHex(keyPair.publicKey);
  }
  static async generatePrivateKeyFromMnemonic(mnemonic: any) {
    await cryptoWaitReady();

    return u8aToHex(mnemonicToMiniSecret(mnemonic));
  }

  /**
   * Generate the public key / private key and wallet address
   *
   * @param {string} mnemonic Mnemoninc string
   * @param {number} derivation Derivation key
   * @param {*} config
   * @returns
   */
  static async generateWalletFromMnemonic(
    mnemonic: string
    // derivation: number,
    // config: any = CONFIG
  ): Promise<WalletDescription> {
    await cryptoWaitReady();
    const keyring = new Keyring({ type: 'sr25519', ss58Format: 42 });
    const keyPair = keyring.createFromUri(mnemonic);

    const privateKey = await this.generatePrivateKeyFromMnemonic(mnemonic);
    const publicKey = u8aToHex(keyPair.publicKey);
    const address = keyPair.address;
    return { privateKey, publicKey, address };
  }
}
