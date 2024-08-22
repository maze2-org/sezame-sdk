import { NodeProvider } from '@alephium/web3';

export type WalletDescription = {
  privateKey: string;
  publicKey: string;
  address: string;
  index?: number;
  group?: number;
  nodeProvider?: NodeProvider;
};
