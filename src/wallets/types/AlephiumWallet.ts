import { ALPH_Driver } from '../../fees/drivers/ALPH_Driver';
import { ALPH_Driver as ALPH_Transaction_Driver } from '../../transactions/drivers/ALPH_Driver';
import { ALPH_Driver as ALPH_Balance_Driver } from '../../balances/drivers/ALPH_Driver';

import { GenericWallet } from '../GenericWallet';

export class AlephiumWallet extends GenericWallet {
  TRANSACTION_DRIVER_NAMESPACE: {
    [key: string]: any;
  } = {
    ALPH_Driver: ALPH_Transaction_Driver,
  };

  FEES_DRIVER_NAMESPACE: {
    [key: string]: any;
  } = {
    ALPH_Driver: ALPH_Driver,
  };

  BALANCE_DRIVER_NAMESPACE: {
    [key: string]: any;
  } = {
    ALPH_Driver: ALPH_Balance_Driver,
  };
}
