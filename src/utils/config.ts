import * as MAINNET_CONFIG_DATA from './config.mainnet.json';
import * as TESTNET_CONFIG_DATA from './config.testnet.json';

interface IGENERIC_ENDPOINTS_MAP {
  [key: string]: string[];
}

export interface IGENERIC_ENDPOINTS {
  balance: any;
  fee: any;
  transaction: any;
  other?: IGENERIC_ENDPOINTS_MAP;
}

export interface CHAIN_ENDPOINTS_MAP {
  [key: string]: IGENERIC_ENDPOINTS;
}

export interface SERVICES_ENDPOINTS_MAP {
  [key: string]: string;
}

export interface IConfig {
  TESTNET: boolean;
  DEFAULT_DERIVATION_KEY: number;
  CHAIN_ENDPOINTS: CHAIN_ENDPOINTS_MAP;
  SERVICES_ENDPOINTS: SERVICES_ENDPOINTS_MAP;
  setTESTNET?(testnet: boolean): void;
}

const TESTNET = String(process.env.TESTNET) === 'true';

const MAINNET_CONFIG: IConfig = MAINNET_CONFIG_DATA;
const TESTNET_CONFIG: IConfig = TESTNET_CONFIG_DATA;

export class Config implements IConfig {
  public TESTNET: boolean;
  public DEFAULT_DERIVATION_KEY!: number;
  public CHAIN_ENDPOINTS!: CHAIN_ENDPOINTS_MAP;
  public SERVICES_ENDPOINTS!: SERVICES_ENDPOINTS_MAP;

  constructor(testNet: boolean) {
    this.TESTNET = testNet;
    this.setConfig();
  }

  public setConfig() {
    const config: IConfig = this.TESTNET ? TESTNET_CONFIG : MAINNET_CONFIG;
    this.TESTNET = config.TESTNET;
    this.DEFAULT_DERIVATION_KEY = config.DEFAULT_DERIVATION_KEY;
    this.CHAIN_ENDPOINTS = config.CHAIN_ENDPOINTS;
    this.SERVICES_ENDPOINTS = config.SERVICES_ENDPOINTS;
  }

  public setTESTNET(value: boolean) {
    this.TESTNET = value;
    this.setConfig();
  }
}

export const CONFIG: IConfig = new Config(TESTNET);
