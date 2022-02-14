# Sezame SDK
The Sezame sdk library handling the wallet interactions
## How to use the library

### Usage in your project
Import the library in your project with `yarn add sezame-sdk`

### Create wallets

```javascript
    // Create a mnemonic
    const mnemonic = sezameSdk.WalletGenerator.generateMnemonic(128);

    // Create an eth wallet
    sezameSdk.WalletGenerator.generateKeyPairFromMnemonic(mnemonic, "ETH", 0);
    // Create an bsc wallet
    sezameSdk.WalletGenerator.generateKeyPairFromMnemonic(mnemonic, "BSC", 0);
    // Create an polygon wallet
    sezameSdk.WalletGenerator.generateKeyPairFromMnemonic(mnemonic, "POLYGON", 0);
    // Create an btc wallet
    sezameSdk.WalletGenerator.generateKeyPairFromMnemonic(mnemonic, "BTC", 0);
    // Create an avn wallet
    sezameSdk.WalletGenerator.generateKeyPairFromMnemonic(mnemonic, "AVN", 0);
    // Create an alephium wallet
    sezameSdk.WalletGenerator.generateKeyPairFromMnemonic(mnemonic, "ALPH", 0),


```

### Make a transaction

```javascript
    // Transfer example with ethereum
    const ethDescriptor = {
        privKey: wallets.eth.privateKey,
        walletAddress: wallets.eth.address,
        chain: "ETH",
        symbol: "ETH",
    };
    const ethWallet = sezameSdk.WalletFactory.getWallet(ethDescriptor);

    const ethFees = await ethWallet.getTxSendProposals("0x53980dF62D3eCAdc564d9B929e2aeD8514180e8b", 0.01);
    const txEth = await ethWallet.postTxSend(ethFees.regular);
    console.log(txEth);

    // Transfer example avn
    process.env.SURI = wallets.avn.privateKey;
    const avnDescriptor = {
        privKey: wallets.avn.privateKey,
        walletAddress: wallets.avn.address,
        chain: "AVN",
        symbol: "AVN",
    };
    const avnWallet = sezameSdk.WalletFactory.getWallet(avnDescriptor);
    const avnFees = await avnWallet.getTxSendProposals("5FZ9egr9M1tGJ1aEUWG6TPkoko8j7cX2TwtchcFmaMWZzMVU", 1);
    const txAvn = await avnWallet.postAvnSend(avnFees.regular);
    console.log(txAvn);

    // Transfer example alph
    const alphDescriptor = {
        privKey: wallets.alph.privateKey,
        pubKey: wallets.alph.publicKey,
        walletAddress: wallets.alph.address,
        chain: "ALPH",
        symbol: "ALPH",
    };
    const alphWallet = sezameSdk.WalletFactory.getWallet(alphDescriptor);
    const alphFees = await alphWallet.getTxSendProposals("1C5axNMef3Xm4QJmK9VySHdEQ8enJcaPYWd3z1LgxyCY9", 1);
    const txAlph = await alphWallet.postTxSend(alphFees.regular);
    console.log(txAlph);
```

## Library Development setup
Run `yarn`. (Installs dependencies and links packages in the workspace.)

### Compilation
Create an `.env` file to configure the platform: `TESTNET=true|false`.  
The default value is `TESTNET=false`.

### Test
Jest tests are set up to run with `TESTNET=true yarn test`. 

# License

The Sezame sdk Library is licensed under the [MIT License](LICENSE).
