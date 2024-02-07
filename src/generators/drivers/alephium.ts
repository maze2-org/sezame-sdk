import { GenericGenerator } from '../GenericGenerator';

import { WalletDescription } from '../../utils/types/WalletDescription';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import { addressToGroup, bs58 } from '@alephium/web3';
import blake from 'blakejs';
import { Client } from '../../utils/alephium/api/client';
import { CONFIG } from '../../utils/config';

export const TOTAL_NUMBER_OF_GROUPS = 4;

export type AddressKeyPair = {
  hash: string;
  index: number;
  publicKey: string;
  privateKey: string;
};

export type WalletProps = {
  address: string;
  publicKey: string;
  privateKey: string;
  seed: Buffer;
  mnemonic: string;
  masterKey: bip32.BIP32Interface;
};

export const getPath = (addressIndex?: number) => {
  if (
    addressIndex !== undefined &&
    (addressIndex < 0 ||
      !Number.isInteger(addressIndex) ||
      addressIndex.toString().includes('e'))
  ) {
    throw new Error('Invalid address index path level');
  }
  // Being explicit: we always use coinType 1234 no matter the network.
  const coinType = "1234'";

  return `m/44'/${coinType}/0'/0/${addressIndex || '0'}`;
};

export class Wallet {
  readonly address: string;
  readonly publicKey: string;
  readonly privateKey: string;
  readonly seed: Buffer;
  readonly mnemonic: string;
  readonly masterKey: bip32.BIP32Interface;

  constructor({
    address,
    publicKey,
    privateKey,
    seed,
    mnemonic,
    masterKey,
  }: WalletProps) {
    this.address = address;
    this.publicKey = publicKey;
    this.privateKey = privateKey;
    this.seed = seed;
    this.mnemonic = mnemonic;
    this.masterKey = masterKey;
  }
}

export const deriveAddressAndKeys = (
  masterKey: bip32.BIP32Interface,
  addressIndex?: number
): AddressKeyPair => {
  const keyPair = masterKey.derivePath(getPath(addressIndex));

  if (!keyPair.privateKey) throw new Error('Missing private key');

  const publicKey = keyPair.publicKey.toString('hex');
  const privateKey = keyPair.privateKey.toString('hex');
  const hash = blake.blake2b(Uint8Array.from(keyPair.publicKey), undefined, 32);
  const pkhash = Buffer.from(hash);
  const type = Buffer.from([0]);
  const bytes = Buffer.concat([type, pkhash]);
  const address = bs58.encode(bytes);

  return { hash: address, publicKey, privateKey, index: addressIndex || 0 };
};

export const getWalletFromSeed = (seed: Buffer, mnemonic: string): Wallet => {
  const masterKey = bip32.fromSeed(seed);
  const { hash, publicKey, privateKey } = deriveAddressAndKeys(masterKey);

  return new Wallet({
    seed,
    address: hash,
    publicKey,
    privateKey,
    mnemonic,
    masterKey,
  });
};

export const getWalletFromMnemonic = (
  mnemonic: string,
  passphrase = ''
): Wallet => {
  const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase);

  return getWalletFromSeed(seed, mnemonic);
};

const findNextAvailableAddressIndex = (
  startIndex: number,
  skipIndexes: number[] = []
) => {
  let nextAvailableAddressIndex = startIndex;

  do {
    nextAvailableAddressIndex++;
  } while (skipIndexes.includes(nextAvailableAddressIndex));

  return nextAvailableAddressIndex;
};

export const deriveNewAddressData = (
  masterKey: bip32.BIP32Interface,
  forGroup?: number,
  addressIndex?: number,
  skipAddressIndexes: number[] = []
): AddressKeyPair => {
  if (
    forGroup !== undefined &&
    (forGroup >= TOTAL_NUMBER_OF_GROUPS ||
      forGroup < 0 ||
      !Number.isInteger(forGroup))
  ) {
    throw new Error('Invalid group number : ' + forGroup);
  }

  const initialAddressIndex = addressIndex || 0;

  let nextAddressIndex = skipAddressIndexes.includes(initialAddressIndex)
    ? findNextAvailableAddressIndex(initialAddressIndex, skipAddressIndexes)
    : initialAddressIndex;
  let newAddressData = deriveAddressAndKeys(masterKey, nextAddressIndex);

  while (
    forGroup !== undefined &&
    addressToGroup(newAddressData.hash, TOTAL_NUMBER_OF_GROUPS) !== forGroup
  ) {
    nextAddressIndex = findNextAvailableAddressIndex(
      newAddressData.index,
      skipAddressIndexes
    );
    newAddressData = deriveAddressAndKeys(masterKey, nextAddressIndex);
  }

  return newAddressData;
};

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
    mnemonic: string,
    _derivation: any,
    _config: any,
    usedIndexes?: number[],
    group?: number
  ): Promise<WalletDescription> {
    const endpoints = CONFIG.CHAIN_ENDPOINTS.ALPH.balance[0].config;
    const client = new Client({
      explorerApiHost: endpoints.explorer,
      explorerUrl: endpoints.explorer_url,
      networkId: endpoints.network_id,
      nodeHost: endpoints.node,
    });

    if (usedIndexes !== undefined) {
      const derived = await this.generateDerivedAddress(
        mnemonic,
        group,
        usedIndexes
      );

      const derivedAddressGroup = (
        await client.node.addresses.getAddressesAddressGroup(derived.hash)
      ).group;

      return {
        privateKey: derived.privateKey,
        publicKey: derived.publicKey,
        address: derived.hash,
        index: derived.index,
        group: derivedAddressGroup,
      };
    }
    const wallet = await getWalletFromMnemonic(mnemonic);
    const mainAddressGroup = (
      await client.node.addresses.getAddressesAddressGroup(wallet.address)
    ).group;
    return {
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      address: wallet.address,
      index: 0,
      group: mainAddressGroup,
    };
  }

  static async generateDerivedAddress(
    mnemonic: string,
    group: number | undefined,
    usedIndexes: number[]
  ) {
    const { masterKey } = getWalletFromMnemonic(mnemonic, '');

    try {
      return deriveNewAddressData(masterKey, group, undefined, usedIndexes);
    } catch (e) {
      console.log(e);
      throw new Error('Unable to make a derived address...');
    }
  }
}
