# Preventing Premature Pool Creation

For pump fun type projects, it is crucial to prevent other users from purchasing tokens early and creating pools on DEX (Decentralized Exchange). If this happens, the initial price set during liquidity migration may not align with the price on DEX, leading to complications.

There are two solutions to address this issue:

## **Using the `mint_pool_creation_cap` Method from Cetus Contracts**  
   This method locks the permission to create specific pools, ensuring only authorized users can create pools for the token. For detailed steps, refer to the [official documentation](https://cetus-1.gitbook.io/cetus-developer-docs/developer/via-contract/features-available/create-pool#id-2.-register-then-create-pool). The process involves calling the following three functions sequentially:

   ```rust
   public fun mint_pool_creation_cap<Coin>(
       config: &GlobalConfig,
       pools: &Pools,
       _: &TreasuryCap<Coin>,
       ctx: &mut TxContext
   ): PoolCreationCap 

   public fun register_permission_pair<CoinTypeA, CoinTypeB>(
       config: &GlobalConfig,
       pools: &mut Pools,
       tick_spacing: u32,
       pool_creation_cap: &PoolCreationCap,
       ctx: &mut TxContext
   ) 

   public fun create_pool_v2_by_creation_cap<CoinTypeA, CoinTypeB>(
       config: &GlobalConfig,
       pools: &mut Pools,
       cap: &PoolCreationCap,
       tick_spacing: u32,
       initialize_price: u128,
       url: String,
       coin_a: Coin<CoinTypeA>,
       coin_b: Coin<CoinTypeB>,
       metadata_a: &CoinMetadata<CoinTypeA>,
       metadata_b: &CoinMetadata<CoinTypeB>,
       fix_amount_a: bool,
       clock: &Clock,
       ctx: &mut TxContext
   ): Position
   ```

   By using this method, you can lock the creation of pools that are commonly used in pump fun projects, such as pools paired with SUI and a trading fee rate of 1%.

## **Restricting `CoinMetaData` Usage**  
   Since creating a pool requires `CoinMetaData` as a parameter, you can limit the creation of pools by restricting access to `CoinMetaData`.  

   - When creating the token, pass the `CoinMetaData` to users and store it as a `dynamic field` in the Bonding Curve during its creation.  
   - Before the token is launched, other users will not be able to create pools for this token.  
   - After the token is launched, retrieve the `CoinMetaData` and use the `freeze_object` method to make it accessible to everyone, allowing pools to be created freely.  

   Using this method, before the token is launched, the indexer cannot index the `CoinMetaData`, which may prevent trading aggregators from directly retrieving token transactions. Additional information can be shared externally using `events`.
