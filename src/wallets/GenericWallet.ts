import { IWallet } from './IWallet';
import { GenericTxProposal } from '../fees/GenericTxProposal';
import { IWalletConfig } from './IWalletConfig';
import { CONFIG } from '../utils/config';
import { GenericBalance } from '../balances/GenericBalance';
import { Web3SigningManager } from './signing/web3';
import { Token } from "@alephium/web3/dist/src/api/api-alephium";

/**
 * Don't use the generic wallet, for a new coin write an implementation
 */
export class GenericWallet implements IWallet {
  config: IWalletConfig;
  address: any = null;
  currency: string | null;
  signingManager: Web3SigningManager | null = null;

  TRANSACTION_DRIVER_NAMESPACE: {
    [key: string]: any;
  } = {};

  FEES_DRIVER_NAMESPACE: {
    [key: string]: any;
  } = {};

  BALANCE_DRIVER_NAMESPACE: {
    [key: string]: any;
  } = {};

  //
  constructor(config: IWalletConfig) {
    this.address = config.walletAddress;
    this.config = config;
    this.currency = this.config.symbol;
    this.signingManager = null;
  }
  //
  getDecimals = async (): Promise<number | null> => {
    if (this.config.decimals === null) {
      throw new Error('Wallet decimals not set!');
    }
    return this.config.decimals;
  };
  getAddress = () => {
    if (!this.address) {
      throw new Error('Wallet address not set!');
    }
    return this.address;
  };

  getAddressGroup = async (_cryptoAddress: string) => {
    // Loop through the drivers to get the balance
    let drivers =
      CONFIG.CHAIN_ENDPOINTS[this.getBlockchainSymbol()]
        ?.transactions_history ?? [];

    for (let i = 0; i < drivers.length; i++) {
      // Try all drivers in case one of them fails
      const driverDescription: any = drivers[i];
      try {
        var driver = new this.TRANSACTION_DRIVER_NAMESPACE[
          driverDescription.driver
        ](this.config, driverDescription.config);

        if (driver.definePrivateKey) {
          driver.definePrivateKey(this.getPrivateKey());
        }

        if (!driver.getTransactionStatus) {
          throw new Error("Address group not implemented for this block-chain")
        }
        return driver.getAddressGroup(_cryptoAddress);
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(e);
        }
        continue;
      }
    }

    return null;
  }

  getPrivateKey = () => {
    if (!this.config.privKey) {
      throw new Error('Wallet private key not set!');
    }
    return this.config.privKey;
  };
  getCurrencyName = async (): Promise<string | null> => {
    if (!this.config.symbol) {
      throw new Error('Wallet currency not set!');
    }
    return this.config.symbol;
  };
  getCurrencySymbol = async (): Promise<string | null> => {
    if (!this.config.symbol) {
      throw new Error('Wallet currency not set!');
    }
    return this.config.symbol;
  };
  getBlockchainSymbol = () => {
    if (!this.config.chain) {
      throw new Error('Wallet blockchain not set!');
    }
    return this.config.chain;
  };
  getSigningManager() {
    return this.signingManager;
  }

  getTransactionsUrl = (cryptoAddress: string): string => {
    // Loop through the drivers to get the balance
    let drivers =
      CONFIG.CHAIN_ENDPOINTS[this.getBlockchainSymbol()]
        ?.transactions_history ?? [];

    for (let i = 0; i < drivers.length; i++) {
      // Try all drivers in case one of them fails
      const driverDescription: any = drivers[i];
      try {
        var driver = new this.TRANSACTION_DRIVER_NAMESPACE[
          driverDescription.driver
        ](this.config, driverDescription.config);

        if (driver.definePrivateKey) {
          driver.definePrivateKey(this.getPrivateKey());
        }
        return driver.getTransactionsUrl(cryptoAddress);
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(e);
        }
        continue;
      }
    }

    return '';
  };

  getTransactionStatus = async (
    txId: string
  ): Promise<'pending' | 'success' | 'failed' | null> => {
    // Loop through the drivers to get the balance
    let drivers =
      CONFIG.CHAIN_ENDPOINTS[this.getBlockchainSymbol()]
        ?.transactions_history ?? [];

    for (let i = 0; i < drivers.length; i++) {
      // Try all drivers in case one of them fails
      const driverDescription: any = drivers[i];
      try {
        var driver = new this.TRANSACTION_DRIVER_NAMESPACE[
          driverDescription.driver
        ](this.config, driverDescription.config);

        if (driver.definePrivateKey) {
          driver.definePrivateKey(this.getPrivateKey());
        }

        return driver.getTransactionStatus(this.config.walletAddress, txId);
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(e);
        }
        continue;
      }
    }

    return null;
  };

  getTransactions = async (): Promise<Array<any>> => {
    // Loop through the drivers to get the balance
    let drivers =
      CONFIG.CHAIN_ENDPOINTS[this.getBlockchainSymbol()]
        ?.transactions_history ?? [];
    let error = null;
    for (let i = 0; i < drivers.length; i++) {
      error = null;
      // Try all drivers in case one of them fails
      const driverDescription: any = drivers[i];
      try {
        var driver = new this.TRANSACTION_DRIVER_NAMESPACE[
          driverDescription.driver
        ](this.config, driverDescription.config);

        if (driver.definePrivateKey) {
          driver.definePrivateKey(this.getPrivateKey());
        }

        let transactions = await driver.getTransactions(this.getAddress());
        return transactions;
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(e);
        }
        continue;
      }
    }

    if (error) {
      throw error;
    }

    let currencySymbol = await this.getCurrencySymbol();
    if (!currencySymbol) {
      throw new Error(
        'Unable to retrieve balance for a contract without a currency symbol!'
      );
    }

    return [];
  };

  // End of common functions
  getBalance = async () => {
    // Loop through the drivers to get the balance
    let drivers =
      CONFIG.CHAIN_ENDPOINTS[this.getBlockchainSymbol()]?.balance ?? [];

    for (let i = 0; i < drivers.length; i++) {
      // Try all drivers in case one of them fails
      const driverDescription: any = drivers[i];
      try {
        var driver = new this.BALANCE_DRIVER_NAMESPACE[
          driverDescription.driver
        ](this.config, driverDescription.config);
        if (driver.definePrivateKey) {
          driver.definePrivateKey(this.getPrivateKey());
        }
        let balance = await driver.getBalance(this.getAddress(), {
          tokenId: this.config.contract,
          decimals: this.config.decimals
        });
        if (balance) {
          return balance;
        }
      } catch (e) {
        console.log(
          '[SDK] Unable to retrieve balance ',
          {
            symbol: this.getBlockchainSymbol(),
          },
          e
        );
        if (process.env.NODE_ENV !== 'production') {
          console.log(e);
        }
        continue;
      }
    }
    let currencySymbol = await this.getCurrencySymbol();
    if (!currencySymbol) {
      throw new Error(
        'Unable to retrieve balance for a contract without a currency symbol!'
      );
    }
    return new GenericBalance(currencySymbol, 0, 0, 0, 0, 0, 0);
  };
  // This is a send currency transaction
  getTxSendProposals = async (
    destination: string,
    valueToSend: any,
    reason?: string
  ) => {
    // Loop through the drivers to get the fees
    let drivers = CONFIG.CHAIN_ENDPOINTS[this.getBlockchainSymbol()]?.fee ?? [];
    let error = null;

    for (let i = 0; i < drivers.length; i++) {
      // Try all drivers in case one of them fails
      const driverDescription: any = drivers[i];

      try {
        error = null;
        var driver = new this.FEES_DRIVER_NAMESPACE[driverDescription.driver](
          this.config,
          driverDescription.config
        );

        if (typeof driver.getTxSendProposals !== 'function') {
          continue;
        }
        let fees = await driver.getTxSendProposals(
          destination,
          valueToSend,
          reason
        );

        if (fees) {
          return fees;
        }
      } catch (e) {
        error = e;
        if (process.env.NODE_ENV !== 'production') {
          console.log(e);
        }
        continue;
      }
    }

    if (error) {
      throw error;
    }
    return null;
  };

  postTxSend = async (transactionProposal: GenericTxProposal, tokens: Token[] = []): Promise<any> => {
    // Loop through the drivers to get the fees

    let drivers =
      CONFIG.CHAIN_ENDPOINTS[this.getBlockchainSymbol()]?.transaction ?? [];

    let error = null;
    for (let i = 0; i < drivers.length; i++) {
      // Try all drivers in case one of them fails
      const driverDescription: any = drivers[i];
      try {
        error = null;
        var driver = new this.TRANSACTION_DRIVER_NAMESPACE[
          driverDescription.driver
        ](this.config, driverDescription.config);

        let tx = await driver.send(transactionProposal, tokens);
        return tx;
      } catch (e) {
        error = e;
        if (process.env.NODE_ENV !== 'production') {
          console.log('COMPLETE ERROR', e);
        }
        continue;
      }
    }

    if (error) {
      throw error;
    }
    return null;
  };

  stake = async (transactionProposal: GenericTxProposal): Promise<any> => {
    // Loop through the drivers to get the fees

    let drivers =
      CONFIG.CHAIN_ENDPOINTS[this.getBlockchainSymbol()]?.transaction ?? [];

    let error = null;
    for (let i = 0; i < drivers.length; i++) {
      // Try all drivers in case one of them fails
      const driverDescription: any = drivers[i];
      try {
        error = null;
        var driver = new this.TRANSACTION_DRIVER_NAMESPACE[
          driverDescription.driver
        ](this.config, driverDescription.config);

        let tx = await driver.stake(transactionProposal);
        return tx;
      } catch (e) {
        error = e;
        if (process.env.NODE_ENV !== 'production') {
          console.log('COMPLETE ERROR', e);
        }
        continue;
      }
    }

    if (error) {
      throw error;
    }
    return null;
  };

  getStakingProperties = async (address: string): Promise<any> => {
    // Loop through the drivers to get the fees

    let drivers =
      CONFIG.CHAIN_ENDPOINTS[this.getBlockchainSymbol()]?.transaction ?? [];

    let error = null;
    for (let i = 0; i < drivers.length; i++) {
      // Try all drivers in case one of them fails
      const driverDescription: any = drivers[i];
      try {
        error = null;
        var driver = new this.TRANSACTION_DRIVER_NAMESPACE[
          driverDescription.driver
        ](this.config, driverDescription.config);

        let stats = await driver.getStakingProperties(address);
        return stats;
      } catch (e) {
        error = e;
        if (process.env.NODE_ENV !== 'production') {
          console.log('COMPLETE ERROR', e);
        }
        continue;
      }
    }

    if (error) {
      throw error;
    }
    return null;
  };

  unstake = async (transactionProposal: GenericTxProposal): Promise<any> => {
    // Loop through the drivers to get the fees

    let drivers =
      CONFIG.CHAIN_ENDPOINTS[this.getBlockchainSymbol()]?.transaction ?? [];

    let error = null;
    for (let i = 0; i < drivers.length; i++) {
      // Try all drivers in case one of them fails
      const driverDescription: any = drivers[i];
      try {
        error = null;
        var driver = new this.TRANSACTION_DRIVER_NAMESPACE[
          driverDescription.driver
        ](this.config, driverDescription.config);

        let tx = await driver.unstake(transactionProposal);
        return tx;
      } catch (e) {
        error = e;
        if (process.env.NODE_ENV !== 'production') {
          console.log('COMPLETE ERROR', e);
        }
        continue;
      }
    }

    if (error) {
      throw error;
    }
    return null;
  };

  withdrawUnlocked = async (): Promise<any> => {
    // Loop through the drivers to get the fees

    let drivers =
      CONFIG.CHAIN_ENDPOINTS[this.getBlockchainSymbol()]?.transaction ?? [];

    let error = null;
    for (let i = 0; i < drivers.length; i++) {
      // Try all drivers in case one of them fails
      const driverDescription: any = drivers[i];
      try {
        error = null;
        var driver = new this.TRANSACTION_DRIVER_NAMESPACE[
          driverDescription.driver
        ](this.config, driverDescription.config);

        let tx = await driver.withdrawUnlocked();
        return tx;
      } catch (e) {
        error = e;
        if (process.env.NODE_ENV !== 'production') {
          console.log('COMPLETE ERROR', e);
        }
        continue;
      }
    }

    if (error) {
      throw error;
    }
    return null;
  };

  swap = async (
    transactionProposal: GenericTxProposal,
    swapType: 'lifting' | 'lowering' | 'swaping'
  ): Promise<any> => {
    // Loop through the drivers to get the fees

    let drivers =
      CONFIG.CHAIN_ENDPOINTS[this.getBlockchainSymbol()]?.transaction ?? [];

    let error = null;
    for (let i = 0; i < drivers.length; i++) {
      // Try all drivers in case one of them fails
      const driverDescription: any = drivers[i];
      try {
        error = null;
        var driver = new this.TRANSACTION_DRIVER_NAMESPACE[
          driverDescription.driver
        ](this.config, driverDescription.config);

        let tx = await driver.swap(transactionProposal, swapType);
        return tx;
      } catch (e) {
        error = e;
        if (process.env.NODE_ENV !== 'production') {
          console.log('COMPLETE ERROR', e);
        }
        continue;
      }
    }

    if (error) {
      throw error;
    }
    return null;
  };

  postRawTxSend = async (transaction: any): Promise<any> => {
    // Loop through the drivers to get the fees
    let drivers =
      CONFIG.CHAIN_ENDPOINTS[this.getBlockchainSymbol()]?.transaction ?? [];
    for (let i = 0; i < drivers.length; i++) {
      // Try all drivers in case one of them fails
      const driverDescription: any = drivers[i];
      try {
        var driver = new this.TRANSACTION_DRIVER_NAMESPACE[
          driverDescription.driver
        ](this.config, driverDescription.config);
        let tx = await driver.sendRaw(transaction);
        return tx;
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(e);
        }
        continue;
      }
    }
    return null;
  };
}
