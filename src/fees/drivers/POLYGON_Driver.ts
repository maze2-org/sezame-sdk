import { FEE_TYPES } from '../IFee';
import { WEB3_Driver } from './WEB3_Driver';
import { PolygonFee } from '../types/PolygonFee';
import Web3 from 'web3';

export class POLYGON_Driver extends WEB3_Driver {
  nativeAssetSymbol: string = 'MATIC';

  getGasFeePrices = async () => {
    // Web3.eth.estimateGas
    const provider = new Web3.providers.HttpProvider(this.getFeeEndpoint());
    const web3 = new Web3(provider);

    // Get the current gas price in gwei
    const gasPrice: string = await web3.eth.getGasPrice();

    let prices: any = {};
    prices[FEE_TYPES.REGULAR] = parseFloat(gasPrice) / 1e9;
    prices[FEE_TYPES.PRIORITY] = parseFloat(gasPrice) / 1e9;

    return prices;
  };

  buildFee = (proposal: any) => {
    return new PolygonFee(proposal);
  };
}
