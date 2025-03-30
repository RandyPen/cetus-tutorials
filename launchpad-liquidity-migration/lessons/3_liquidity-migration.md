# Migration Liquidity


## Calculating Initial Price

When migrating liquidity to the Cetus Pool, there are typically two types of coins involved, often an alt coin and a sui coin. If you want to add liquidity across the full range, you can use the following method to calculate the initial sqrt price of the pool.

```rust
const PRICE_MULTIPER_DECIMAL: u8 = 10;
const ORACLE_PRICE_MULTIPER_DECIMAL: u8 = 10;
const UINT64_MAX: u128 = 0xffffffffffffffff;

public fun calculate_sqrt_price(base_amount: u64, quoto_amount: u64): u128 {
    let price: u128 = std::u128::pow(10, PRICE_MULTIPER_DECIMAL) * (quote_amount as u128) / (base_amount as u128);
    let sqrt_val: u128 = std::u128::sqrt(price);
    let sqrt_price: u128 = integer_mate::full_math_u128::mul_div_floor(
        sqrt_val,
        UINT64_MAX,
        std::u128::pow(10, (PRICE_MULTIPER_DECIMAL + ORACLE_PRICE_MULTIPER_DECIMAL) /2),
    );
    sqrt_price
}
```

[integer_math](https://github.com/CetusProtocol/integer-mate) is a library of signed number calculation formulas open-sourced by the Cetus team.