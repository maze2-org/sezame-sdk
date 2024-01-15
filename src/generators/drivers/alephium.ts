import { GenericGenerator } from '../GenericGenerator';

import { WalletDescription } from '../../utils/types/WalletDescription';
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import { bs58 } from '@alephium/web3';
import blake from 'blakejs'

export type AddressKeyPair = {
  hash: string
  index: number
  publicKey: string
  privateKey: string
}

export type WalletProps = {
  address: string
  publicKey: string
  privateKey: string
  seed: Buffer
  mnemonic: string
  masterKey: bip32.BIP32Interface
}

export const getPath = (addressIndex?: number) => {
  if (
    addressIndex !== undefined &&
    (addressIndex < 0 || !Number.isInteger(addressIndex) || addressIndex.toString().includes('e'))
  ) {
    throw new Error('Invalid address index path level')
  }
  // Being explicit: we always use coinType 1234 no matter the network.
  const coinType = "1234'"

  return `m/44'/${coinType}/0'/0/${addressIndex || '0'}`
}

export class Wallet {
  readonly address: string
  readonly publicKey: string
  readonly privateKey: string
  readonly seed: Buffer
  readonly mnemonic: string
  readonly masterKey: bip32.BIP32Interface

  constructor({ address, publicKey, privateKey, seed, mnemonic, masterKey }: WalletProps) {
    this.address = address
    this.publicKey = publicKey
    this.privateKey = privateKey
    this.seed = seed
    this.mnemonic = mnemonic
    this.masterKey = masterKey
  }
}

export const deriveAddressAndKeys = (masterKey: bip32.BIP32Interface, addressIndex?: number): AddressKeyPair => {
  const keyPair = masterKey.derivePath(getPath(addressIndex))

  if (!keyPair.privateKey) throw new Error('Missing private key')

  const publicKey = keyPair.publicKey.toString('hex')
  const privateKey = keyPair.privateKey.toString('hex')
  const hash = blake.blake2b(Uint8Array.from(keyPair.publicKey), undefined, 32)
  const pkhash = Buffer.from(hash)
  const type = Buffer.from([0])
  const bytes = Buffer.concat([type, pkhash])
  const address = bs58.encode(bytes)

  return { hash: address, publicKey, privateKey, index: addressIndex || 0 }
}

export const getWalletFromSeed = (seed: Buffer, mnemonic: string): Wallet => {
  const masterKey = bip32.fromSeed(seed)
  const { hash, publicKey, privateKey } = deriveAddressAndKeys(masterKey)

  return new Wallet({ seed, address: hash, publicKey, privateKey, mnemonic, masterKey })
}

export const getWalletFromMnemonic = (mnemonic: string, passphrase = ''): Wallet => {
  const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase)

  return getWalletFromSeed(seed, mnemonic)
}

/**
 *
 *
 * @export
 * @class AlephiumGenerator
 * @extends {GenericGenerator}
 */
export class AlephiumGenerator extends GenericGenerator {

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
  ): Promise<WalletDescription> {
    const wallet = await getWalletFromMnemonic(mnemonic);
    return {
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      address: wallet.address,
    };
  }
}
