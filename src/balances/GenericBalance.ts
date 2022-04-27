import { IBalance } from './IBalance';
import BigNumber from 'bignumber.js';

export class GenericBalance implements IBalance {
  currency: string = '';
  value = 0;
  unconfirmedBalance = 0;
  confirmedBalance = 0;
  stakedBalance = 0;
  unlockedBalance = 0;
  unstakedBalance = 0;
  freeBalance = 0;

  constructor(
    currency: string,
    confirmedBalance: number,
    unconfirmedBalance: number,
    stakedBalance?: number,
    unlockedBalance?: number,
    unstakedBalance?: number,
    freeBalance?: number
  ) {
    this.currency = currency;
    this.value = Number(
      new BigNumber(confirmedBalance).plus(new BigNumber(unconfirmedBalance))
    );
    this.confirmedBalance = confirmedBalance;
    this.unconfirmedBalance = unconfirmedBalance;
    this.stakedBalance = stakedBalance || 0;
    this.unlockedBalance = unlockedBalance || 0;
    this.unstakedBalance = unstakedBalance || 0;
    this.freeBalance = freeBalance || 0;
  }
  getValue() {
    return this.value;
  }
  getConfirmedBalance() {
    return this.confirmedBalance;
  }
  getUnconfirmedBalance() {
    return this.unconfirmedBalance;
  }

  getstakedBalance() {
    return this.stakedBalance;
  }

  getUnstakedBalance() {
    return this.unstakedBalance;
  }

  getUnlockedBalance() {
    return this.unlockedBalance;
  }

  getFreeBalance() {
    return this.freeBalance;
  }
}
