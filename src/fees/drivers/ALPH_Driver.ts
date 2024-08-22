import { IFeeMap, FEE_TYPES } from '../IFee';
import { GenericDriver } from '../GenericDriver';
import { AlephiumFee } from '../types/AlephiumFee';

export class ALPH_Driver extends GenericDriver {
  nativeAssetSymbol: string = 'ALPH';

  buildFee = (proposal: any) => {
    return new AlephiumFee(proposal);
  };

  getTxSendProposals = async (
    destination: string,
    valueToSend: number,
    reason?: string
  ) => {
    let fees: IFeeMap = {};

    if (!this.checkAddressValidity(destination)) {
      throw new Error('Destination address does not exist');
    }

    let value = 0;

    switch (reason) {
      case 'bridge':
        value = 5140100000000000;
        break;

      default:
        value = 2000000000000000;
        break;
    }

    fees[FEE_TYPES.REGULAR] = this.buildFee({
      value,
      proposal: {
        to: destination,
        valueToSend,
      },
    });

    return fees;
  };

  checkAddressValidity = (address: string) => {
    const match = address.match(/^[1-9A-HJ-NP-Za-km-z]{44,45}/);

    if (match === null) return false;

    return match[0] === address && address;
  };

  getProposalEndpoint() {
    const endpoint = this.config.proposal_endpoint;
    if (endpoint) {
      return endpoint;
    }
    throw new Error(this.currency + ' Balance currency is required in config');
  }
}
