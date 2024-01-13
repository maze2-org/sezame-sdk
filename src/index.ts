import 'isomorphic-fetch';
import * as Generators from './generators';
import * as Balances from './balances';
import * as Fees from './fees';
import * as Transactions from './transactions';
import * as CurrencyFunctionsfrom from './currencyFunctions';
import BigNumber from 'bignumber.js';

if (typeof process !== 'undefined' && process.cwd) {
    require('dotenv').config();
}

// Set the big number maximum size
BigNumber.set({ EXPONENTIAL_AT: 100 });

export { Currency } from './currencies';
export { Chains } from './chains';
export { WalletFactory } from './walletFactory';
export { IWalletConfig } from './wallets/IWalletConfig';
export { WalletGenerator } from './walletGenerator';
export { IConfig, CONFIG } from './utils/config';
export { Generators };
export { Balances };
export { Fees };
export { Transactions };
export { CurrencyFunctionsfrom };
export { getAllCoins, getCoins } from './market/getCoins';
export { checkAddress } from './utils/checkAddress';
