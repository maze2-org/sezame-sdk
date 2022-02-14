import { IFeeMap, FEE_TYPES } from '../IFee';
import { GenericDriver } from '../GenericDriver';
import { AventusFee } from '../types/AventusFee';

export class AVN_Driver extends GenericDriver {
  nativeAssetSymbol: string = 'AVT';

  buildFee = (proposal: any) => {
    return new AventusFee(proposal);
  };

  getTxSendProposals = async (destination: string, valueToSend: number) => {
    let fees: IFeeMap = {};

    fees[FEE_TYPES.REGULAR] = this.buildFee({
      value: 0,
      proposal: {
        to: destination,
        valueToSend,
      },
    });

    return fees;
  };

  getProposalEndpoint() {
    const endpoint = this.config.proposal_endpoint;
    if (endpoint) {
      return endpoint;
    }
    throw new Error(this.currency + ' Balance currency is required in config');
  }
}