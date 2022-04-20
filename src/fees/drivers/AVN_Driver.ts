import { IFeeMap, FEE_TYPES } from '../IFee';
import { GenericDriver } from '../GenericDriver';
import { AventusFee } from '../types/AventusFee';
import BigNumber from 'bignumber.js';
// import { AVT_UNIT } from '../../constants';
const AvnApi = require('avn-api');

export class AVN_Driver extends GenericDriver {
  nativeAssetSymbol: string = 'AVT';

  buildFee = (proposal: any) => {
    return new AventusFee(proposal);
  };

  getTxSendProposals = async (destination: string, valueToSend: number) => {
    let fees: IFeeMap = {};

    try {
      const api = new AvnApi(this.config.avn_gateway_endpoint, {
        suri: process.env.SURI,
      });
      await api.init();

      const feeAmount = await api.query.getRelayerFees(this.config.avn_relayer);

      fees[FEE_TYPES.REGULAR] = this.buildFee({
        value: new BigNumber(feeAmount.proxyAvtTransfer),
        proposal: {
          to: destination,
          valueToSend,
        },
      });
    } catch (err) {
      throw new Error('INSUFFICIENT_FUNDS');
    }

    return fees;
  };
}
