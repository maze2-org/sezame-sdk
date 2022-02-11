import { GenericGenerator } from '../GenericGenerator';

import { Keyring } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';
import { cryptoWaitReady, mnemonicToMiniSecret } from '@polkadot/util-crypto';

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
}
