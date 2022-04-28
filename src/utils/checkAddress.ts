import { hexToU8a, isHex } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import Web3 from 'web3';
import { validate } from 'bitcoin-address-validation';

/**
 * Check Aventus address validity (same format as polkadot)
 * @param address
 * @returns boolean
 */
const isValidAvnAddress = (address: string) => {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address));
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Check Etherem address validity (using the web3 library)
 * @param address
 * @returns boolean
 */
const isValidEthAddress = (address: string) => {
  return Web3.utils.isAddress(address);
};

/**
 * Check Polygon address validity (polygon uses the same validation as ethereum)
 * @param address
 * @returns boolean
 */
const isValidPolygonAddress = (address: string) => {
  return Web3.utils.isAddress(address);
};

/**
 * Check Binance smart chain address validity (bsc uses the same validation as ethereum)
 * @param address
 * @returns boolean
 */
const isValidBscAddress = (address: string) => {
  return Web3.utils.isAddress(address);
};

/**
 * Check Alephium address validity
 * @param address
 * @returns boolean
 */
const isValidAlphAddress = (address: string) => {
  return !!address.match(/^[1-9A-HJ-NP-Za-km-z]{44,45}$/);
};

/**
 * Check Bitcoin address validity
 * @param address
 * @returns boolean
 */
const isValidBtcAddress = (address: string) => {
  return validate(address);
};

export const checkAddress = (
  address: string,
  network: 'AVN' | 'BTC' | 'ETH' | 'POLYGON' | 'ALPH' | 'BSC'
) => {
  switch (network) {
    case 'AVN':
      return isValidAvnAddress(address);
    case 'BTC':
      return isValidBtcAddress(address);
    case 'ETH':
      return isValidEthAddress(address);
    case 'POLYGON':
      return isValidPolygonAddress(address);
    case 'ALPH':
      return isValidAlphAddress(address);
    case 'BSC':
      return isValidBscAddress(address);
  }

  return true;
};
