/*
Copyright 2018 - 2023 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { ExplorerProvider, NodeProvider } from '@alephium/web3'
import fetchRetry, { RequestInitWithRetry } from 'fetch-retry'
import { clone } from 'lodash'

export interface NetworkSettings {
    networkId: number
    nodeHost: string
    explorerApiHost: string
    explorerUrl: string
}

export enum NetworkName {
    mainnet = 'mainnet',
    testnet = 'testnet',
    custom = 'custom'
}

export type NetworkPreset = Exclude<NetworkName, 'custom'>

export type NetworkStatus = 'offline' | 'connecting' | 'online' | 'uninitialized'

export const networkPresetSettings: Record<NetworkPreset, NetworkSettings> = {
    [NetworkName.mainnet]: {
        networkId: 0,
        nodeHost: 'https://wallet-v20.mainnet.alephium.org',
        explorerApiHost: 'https://backend-v115.mainnet.alephium.org',
        explorerUrl: 'https://explorer.alephium.org'
    },
    [NetworkName.testnet]: {
        networkId: 1,
        nodeHost: 'https://wallet-v20.testnet.alephium.org',
        explorerApiHost: 'https://backend-v115.testnet.alephium.org',
        explorerUrl: 'https://testnet.alephium.org'
    }
}


export const defaultNetwork = NetworkName.mainnet


export const defaultNetworkSettings: NetworkSettings = clone(networkPresetSettings[defaultNetwork])
export const exponentialBackoffFetchRetry = fetchRetry(fetch, {
    retryOn: [429],
    retries: 10,
    retryDelay: (attempt: any) => Math.pow(2, attempt) * 1000
}) as (input: RequestInfo | URL, init?: RequestInitWithRetry | undefined) => Promise<Response>

export class Client {
    node: NodeProvider
    explorer: ExplorerProvider

    constructor({ nodeHost, explorerApiHost }: NetworkSettings) {
        this.node = new NodeProvider(nodeHost, undefined, exponentialBackoffFetchRetry)
        this.explorer = new ExplorerProvider(explorerApiHost, undefined, exponentialBackoffFetchRetry)
    }

    init(nodeHost: NetworkSettings['nodeHost'], explorerApiHost: NetworkSettings['explorerApiHost']) {
        this.node = new NodeProvider(nodeHost, undefined, exponentialBackoffFetchRetry)
        this.explorer = new ExplorerProvider(explorerApiHost, undefined, exponentialBackoffFetchRetry)
    }
}

const client = new Client(defaultNetworkSettings)

export default client
