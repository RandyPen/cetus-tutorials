import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { bcs } from "@mysten/sui/bcs";

const mnemonics: string = process.env.MNEMONICS!;
const keypair = Ed25519Keypair.deriveKeypair(mnemonics);
const address = keypair.toSuiAddress();

const client = new SuiClient({
    url: getFullnodeUrl("mainnet"),
});

const PACKAGE = "0xc6faf3703b0e8ba9ed06b7851134bbbe7565eb35ff823fd78432baa4cbeaa12e";
const GlobalConfig = "0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f";
const Pool = "0x1efc96c99c9d91ac0f54f0ca78d2d9a6ba11377d29354c0a192c86f0495ddec7";

const CoinAType = "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC";
const CoinBType = "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN";

function getFee(input: number, feeTier: number): number {
    if (typeof input !== 'number') {
        throw new Error('Input must be a number');
    }

    const result = input * feeTier / 1_000_000;
    return Math.ceil(result);
}

const amount: number = 987654321;
const fee: number = getFee(amount, 100);

const tx = new Transaction();
const [balanceA, balanceB, flreceipt] = tx.moveCall({
    package: PACKAGE,
    module: "pool",
    function: "flash_loan",
    arguments: [
        tx.object(GlobalConfig),
        tx.object(Pool),
        tx.pure(bcs.bool().serialize(true).toBytes()),
        tx.pure(bcs.u64().serialize(amount).toBytes()),
    ],
    typeArguments: [
        CoinAType,
        CoinBType,
    ],
});
// do sth
const [reBalance] = tx.moveCall({
    package: "0x2",
    module: "coin",
    function: "split",
    arguments: [
        balanceA,
        tx.pure(bcs.u64().serialize(amount + fee).toBytes()),
    ],
    typeArguments: [
        CoinAType,
    ],
});

tx.moveCall({
    package: PACKAGE,
    module: "pool",
    function: "repay_flash_loan",
    arguments: [
        tx.object(GlobalConfig),
        tx.object(Pool),
        reBalance,
        balanceB, 
        flreceipt,
    ],
    typeArguments: [
        CoinAType,
        CoinBType,
    ],
});

const [profit] = tx.moveCall({
    package: "0x2",
    module: "coin",
    function: "from_balance",
    arguments: [
        balanceA,
    ],
    typeArguments: [
        CoinAType,
    ],
});

tx.moveCall({
    package: "0x2",
    module: "transfer",
    function: "public_transfer",
    arguments: [
        profit,
        tx.pure(bcs.Address.serialize(address).toBytes()),
    ],
    typeArguments: [
        "0x2::coin::Coin<"+CoinAType+">",
    ],
});

tx.setSender(address);
const dataSentToFullnode = await tx.build({ client: client });
const dryrunResult = await client.dryRunTransactionBlock({
    transactionBlock: dataSentToFullnode,
});
console.log(dryrunResult.balanceChanges);

const result = await client.signAndExecuteTransaction({ signer: keypair, transaction: tx });
console.log("result", result);