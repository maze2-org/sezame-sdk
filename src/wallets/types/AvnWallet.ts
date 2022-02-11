import { AVN_Driver } from '../../fees/drivers/AVN_Driver';
import { AVN_Driver as AVN_Transaction_Driver } from '../../transactions/drivers/AVN_Driver';
import { AVN_Driver as AVN_Balance_Driver } from '../../balances/drivers/AVN_Driver';

import { GenericWallet } from '../GenericWallet';

export class AvnWallet extends GenericWallet {
  TRANSACTION_DRIVER_NAMESPACE: {
    [key: string]: any;
  } = {
    AVN_Driver: AVN_Transaction_Driver,
  };

  FEES_DRIVER_NAMESPACE: {
    [key: string]: any;
  } = {
    AVN_Driver: AVN_Driver,
  };

  BALANCE_DRIVER_NAMESPACE: {
    [key: string]: any;
  } = {
    AVN_Driver: AVN_Balance_Driver,
  };
}
