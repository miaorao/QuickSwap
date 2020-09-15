## `QuickSwapERC20`






### `_mint(address to, uint256 value)` (internal)





### `_burn(address from, uint256 value)` (internal)





### `approve(address spender, uint256 value) → bool` (external)





### `transfer(address to, uint256 value) → bool` (external)





### `transferFrom(address from, address to, uint256 value) → bool` (external)





### `permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)` (external)






### `Approval(address owner, address spender, uint256 value)`





### `Transfer(address from, address to, uint256 value)`







## `QuickSwapFactory`






### `constructor(address _feeToSetter)` (public)





### `allPairsLength() → uint256` (external)





### `createPair(address tokenA, address tokenB) → address pair` (external)





### `setFeeTo(address _feeTo)` (external)





### `setFeeToSetter(address _feeToSetter)` (external)





### `setMigrator(address _migrator)` (external)






### `PairCreated(address token0, address token1, address pair, uint256)`







## `IMigrator`






### `desiredLiquidity() → uint256` (external)








## `QuickSwapPair`





### `lock()`






### `getReserves() → uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast` (public)





### `getVirtualPrice() → uint224 _virtualPrice, uint32 _lastPriceTime` (public)





### `initialize(address _token0, address _token1)` (external)





### `mint(address to) → uint256 liquidity` (external)





### `burn(address to) → uint256 amount0, uint256 amount1` (external)





### `_updateVirtualPrice(uint112 _reserve0, uint112 _reserve1)` (internal)





### `swap(uint256 amount0Out, uint256 amount1Out, address to, bytes data)` (external)





### `_getToken0MarketPrice() → uint256 price` (internal)





### `getTokenMarketPrice(address token) → uint256 price` (external)





### `_getAmountOut(address token, uint256 amountIn, uint256 t0Price) → uint256 _out` (internal)





### `_getAmountIn(address token, uint256 amountOut, uint256 t0Price) → uint256 _in` (internal)





### `getAmountOutMarket(address token, uint256 amountIn) → uint256 _out, uint256 t0Price` (public)





### `getAmountInMarket(address token, uint256 amountOut) → uint256 _in, uint256 t0Price` (public)





### `getAmountOutPool(address token, uint256 amountIn) → uint256 _out, uint256 t0Price` (public)





### `getAmountInPool(address token, uint256 amountOut) → uint256 _in, uint256 t0Price` (public)





### `getAmountOutReal(uint256 amountIn, uint256 _reserveIn, uint256 _reserveOut) → uint256 _out` (internal)





### `getAmountInReal(uint256 amountOut, uint256 _reserveIn, uint256 _reserveOut) → uint256 _in` (internal)





### `getAmountOutFinal(address token, uint256 amountIn) → uint256 amountOut, uint256 stokenAmount` (external)





### `getAmountInFinal(address token, uint256 amountOut) → uint256 amountIn, uint256 stokenAmount` (external)





### `dealSlippageWithIn(address[] path, uint256 amountIn, address to, bool ifmint) → uint256 amountOut` (external)





### `dealSlippageWithOut(address[] path, uint256 amountOut, address to, bool ifmint) → uint256 extra` (external)





### `skim(address to)` (external)





### `sync()` (external)






### `Mint(address sender, uint256 amount0, uint256 amount1)`





### `Burn(address sender, uint256 amount0, uint256 amount1, address to)`





### `Swap(address sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address to)`





### `Sync(uint112 reserve0, uint112 reserve1)`







## `QuickSwapRouter`





### `ensure(uint256 deadline)`






### `constructor(address _factory, address _WETH)` (public)





### `receive()` (external)





### `_addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin) → uint256 amountA, uint256 amountB` (internal)





### `addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) → uint256 amountA, uint256 amountB, uint256 liquidity` (external)





### `addLiquidityETH(address token, uint256 amountTokenDesired, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) → uint256 amountToken, uint256 amountETH, uint256 liquidity` (external)





### `removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) → uint256 amountA, uint256 amountB` (public)





### `removeLiquidityETH(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) → uint256 amountToken, uint256 amountETH` (public)





### `removeLiquidityWithPermit(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) → uint256 amountA, uint256 amountB` (external)





### `removeLiquidityETHWithPermit(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) → uint256 amountToken, uint256 amountETH` (external)





### `removeLiquidityETHSupportingFeeOnTransferTokens(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) → uint256 amountETH` (public)





### `removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) → uint256 amountETH` (external)





### `_swap(uint256[] amounts, address[] path, address _to)` (internal)





### `swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline, bool ifmint) → uint256[] amounts` (external)





### `swapTokensForExactTokens(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline, bool ifmint) → uint256[] amounts` (external)





### `swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline, bool ifmint) → uint256[] amounts` (external)





### `swapTokensForExactETH(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline, bool ifmint) → uint256[] amounts` (external)





### `swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline, bool ifmint) → uint256[] amounts` (external)





### `swapETHForExactTokens(uint256 amountOut, address[] path, address to, uint256 deadline, bool ifmint) → uint256[] amounts` (external)





### `_swapSupportingFeeOnTransferTokens(address[] path, address _to, bool ifmint)` (internal)





### `swapExactTokensForTokensSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline, bool ifmint)` (external)





### `swapExactETHForTokensSupportingFeeOnTransferTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline, bool ifmint)` (external)





### `swapExactTokensForETHSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline, bool ifmint)` (external)





### `quote(uint256 amountA, uint256 reserveA, uint256 reserveB) → uint256 amountB` (public)





### `getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) → uint256 amountOut` (public)





### `getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) → uint256 amountIn` (public)





### `getAmountsOut(uint256 amountIn, address[] path) → uint256[] amounts` (public)





### `getAmountsIn(uint256 amountOut, address[] path) → uint256[] amounts` (public)








## `QuickSwapSlippageToken`





### `onlyOwner()`






### `constructor(uint256 initialSupply)` (public)





### `_mint(address to, uint256 value)` (internal)





### `_burn(address from, uint256 value)` (internal)





### `approve(address spender, uint256 value) → bool` (external)





### `transfer(address to, uint256 value) → bool` (external)





### `transferFrom(address from, address to, uint256 value) → bool` (external)





### `mint(address to, uint256 value) → bool` (external)





### `burn(address from, uint256 value) → bool` (external)






### `Approval(address owner, address spender, uint256 value)`





### `Transfer(address from, address to, uint256 value)`







## `IERC20`






### `name() → string` (external)





### `symbol() → string` (external)





### `decimals() → uint8` (external)





### `totalSupply() → uint256` (external)





### `balanceOf(address owner) → uint256` (external)





### `allowance(address owner, address spender) → uint256` (external)





### `approve(address spender, uint256 value) → bool` (external)





### `transfer(address to, uint256 value) → bool` (external)





### `transferFrom(address from, address to, uint256 value) → bool` (external)





### `mint(address to, uint256 value) → bool` (external)





### `burn(address from, uint256 value) → bool` (external)






### `Approval(address owner, address spender, uint256 value)`





### `Transfer(address from, address to, uint256 value)`







## `IQuickSwapCallee`






### `QuickSwapCall(address sender, uint256 amount0, uint256 amount1, bytes data)` (external)








## `IQuickSwapERC20`






### `name() → string` (external)





### `symbol() → string` (external)





### `decimals() → uint8` (external)





### `totalSupply() → uint256` (external)





### `balanceOf(address owner) → uint256` (external)





### `allowance(address owner, address spender) → uint256` (external)





### `approve(address spender, uint256 value) → bool` (external)





### `transfer(address to, uint256 value) → bool` (external)





### `transferFrom(address from, address to, uint256 value) → bool` (external)





### `DOMAIN_SEPARATOR() → bytes32` (external)





### `PERMIT_TYPEHASH() → bytes32` (external)





### `nonces(address owner) → uint256` (external)





### `permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)` (external)






### `Approval(address owner, address spender, uint256 value)`





### `Transfer(address from, address to, uint256 value)`







## `IQuickSwapFactory`






### `feeTo() → address` (external)





### `feeToSetter() → address` (external)





### `migrator() → address` (external)





### `getPair(address tokenA, address tokenB) → address pair` (external)





### `allPairs(uint256) → address pair` (external)





### `allPairsLength() → uint256` (external)





### `createPair(address tokenA, address tokenB) → address pair` (external)





### `setFeeTo(address)` (external)





### `setFeeToSetter(address)` (external)





### `setMigrator(address)` (external)






### `PairCreated(address token0, address token1, address pair, uint256)`







## `IQuickSwapPair`






### `name() → string` (external)





### `symbol() → string` (external)





### `decimals() → uint8` (external)





### `totalSupply() → uint256` (external)





### `balanceOf(address owner) → uint256` (external)





### `allowance(address owner, address spender) → uint256` (external)





### `approve(address spender, uint256 value) → bool` (external)





### `transfer(address to, uint256 value) → bool` (external)





### `transferFrom(address from, address to, uint256 value) → bool` (external)





### `DOMAIN_SEPARATOR() → bytes32` (external)





### `PERMIT_TYPEHASH() → bytes32` (external)





### `nonces(address owner) → uint256` (external)





### `permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)` (external)





### `MINIMUM_LIQUIDITY() → uint256` (external)





### `factory() → address` (external)





### `token0() → address` (external)





### `token1() → address` (external)





### `stoken() → address` (external)





### `getReserves() → uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast` (external)





### `price0CumulativeLast() → uint256` (external)





### `price1CumulativeLast() → uint256` (external)





### `kLast() → uint256` (external)





### `mint(address to) → uint256 liquidity` (external)





### `burn(address to) → uint256 amount0, uint256 amount1` (external)





### `swap(uint256 amount0Out, uint256 amount1Out, address to, bytes data)` (external)





### `skim(address to)` (external)





### `sync()` (external)





### `initialize(address, address)` (external)





### `dealSlippageWithIn(address[] path, uint256 amountIn, address to, bool ifmint) → uint256 amountOut` (external)





### `dealSlippageWithOut(address[] path, uint256 amountOut, address to, bool ifmint) → uint256 extra` (external)





### `getAmountOutMarket(address token, uint256 amountIn) → uint256 _out, uint256 t0Price` (external)





### `getAmountInMarket(address token, uint256 amountOut) → uint256 _in, uint256 t0Price` (external)





### `getAmountOutFinal(address token, uint256 amountIn) → uint256 amountOut, uint256 stokenAmount` (external)





### `getAmountInFinal(address token, uint256 amountOut) → uint256 amountIn, uint256 stokenAmount` (external)





### `getTokenMarketPrice(address token) → uint256 price` (external)






### `Approval(address owner, address spender, uint256 value)`





### `Transfer(address from, address to, uint256 value)`





### `Mint(address sender, uint256 amount0, uint256 amount1)`





### `Burn(address sender, uint256 amount0, uint256 amount1, address to)`





### `Swap(address sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address to)`





### `Sync(uint112 reserve0, uint112 reserve1)`







## `IQuickSwapRouter`






### `factory() → address` (external)





### `WETH() → address` (external)





### `addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) → uint256 amountA, uint256 amountB, uint256 liquidity` (external)





### `addLiquidityETH(address token, uint256 amountTokenDesired, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) → uint256 amountToken, uint256 amountETH, uint256 liquidity` (external)





### `removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) → uint256 amountA, uint256 amountB` (external)





### `removeLiquidityETH(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) → uint256 amountToken, uint256 amountETH` (external)





### `removeLiquidityWithPermit(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) → uint256 amountA, uint256 amountB` (external)





### `removeLiquidityETHWithPermit(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) → uint256 amountToken, uint256 amountETH` (external)





### `swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline, bool ifmint) → uint256[] amounts` (external)





### `swapTokensForExactTokens(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline, bool ifmint) → uint256[] amounts` (external)





### `swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline, bool ifmint) → uint256[] amounts` (external)





### `swapTokensForExactETH(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline, bool ifmint) → uint256[] amounts` (external)





### `swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline, bool ifmint) → uint256[] amounts` (external)





### `swapETHForExactTokens(uint256 amountOut, address[] path, address to, uint256 deadline, bool ifmint) → uint256[] amounts` (external)





### `quote(uint256 amountA, uint256 reserveA, uint256 reserveB) → uint256 amountB` (external)





### `getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) → uint256 amountOut` (external)





### `getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) → uint256 amountIn` (external)





### `getAmountsOut(uint256 amountIn, address[] path) → uint256[] amounts` (external)





### `getAmountsIn(uint256 amountOut, address[] path) → uint256[] amounts` (external)





### `removeLiquidityETHSupportingFeeOnTransferTokens(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) → uint256 amountETH` (external)





### `removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) → uint256 amountETH` (external)





### `swapExactTokensForTokensSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline, bool ifmint)` (external)





### `swapExactETHForTokensSupportingFeeOnTransferTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline, bool ifmint)` (external)





### `swapExactTokensForETHSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline, bool ifmint)` (external)








## `IWETH`






### `deposit()` (external)





### `transfer(address to, uint256 value) → bool` (external)





### `withdraw(uint256)` (external)








## `AddressStringUtil`






### `toAsciiString(address addr, uint256 len) → string` (internal)








## `Babylonian`






### `sqrt(uint256 y) → uint256 z` (internal)








## `FixedPoint`






### `encode(uint112 x) → struct FixedPoint.uq112x112` (internal)





### `encode144(uint144 x) → struct FixedPoint.uq144x112` (internal)





### `div(struct FixedPoint.uq112x112 self, uint112 x) → struct FixedPoint.uq112x112` (internal)





### `mul(struct FixedPoint.uq112x112 self, uint256 y) → struct FixedPoint.uq144x112` (internal)





### `fraction(uint112 numerator, uint112 denominator) → struct FixedPoint.uq112x112` (internal)





### `decode(struct FixedPoint.uq112x112 self) → uint112` (internal)





### `decode144(struct FixedPoint.uq144x112 self) → uint144` (internal)





### `reciprocal(struct FixedPoint.uq112x112 self) → struct FixedPoint.uq112x112` (internal)





### `sqrt(struct FixedPoint.uq112x112 self) → struct FixedPoint.uq112x112` (internal)








## `Math`






### `min(uint256 x, uint256 y) → uint256 z` (internal)





### `sqrt(uint256 y) → uint256 z` (internal)








## `PairNamer`






### `pairName(address token0, address token1, string prefix, string suffix) → string` (internal)





### `pairSymbol(address token0, address token1, string suffix) → string` (internal)








## `QuickSwapLibrary`






### `sortTokens(address tokenA, address tokenB) → address token0, address token1` (internal)





### `pairFor(address factory, address tokenA, address tokenB) → address pair` (internal)





### `getReserves(address factory, address tokenA, address tokenB) → uint256 reserveA, uint256 reserveB` (internal)





### `quote(uint256 amountA, uint256 reserveA, uint256 reserveB) → uint256 amountB` (internal)





### `getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) → uint256 amountOut` (internal)





### `getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) → uint256 amountIn` (internal)





### `getAmountsOut(address factory, uint256 amountIn, address[] path) → uint256[] amounts` (internal)





### `getAmountsIn(address factory, uint256 amountOut, address[] path) → uint256[] amounts` (internal)








## `QuickSwapOracleLibrary`






### `currentBlockTimestamp() → uint32` (internal)





### `currentCumulativePrices(address pair) → uint256 price0Cumulative, uint256 price1Cumulative, uint32 blockTimestamp` (internal)








## `SafeERC20Namer`






### `tokenSymbol(address token) → string` (internal)





### `tokenName(address token) → string` (internal)








## `SafeMath`






### `add(uint256 x, uint256 y) → uint256 z` (internal)





### `sub(uint256 x, uint256 y) → uint256 z` (internal)





### `mul(uint256 x, uint256 y) → uint256 z` (internal)








## `TransferHelper`






### `safeApprove(address token, address to, uint256 value)` (internal)





### `safeTransfer(address token, address to, uint256 value)` (internal)





### `safeTransferFrom(address token, address from, address to, uint256 value)` (internal)





### `safeTransferETH(address to, uint256 value)` (internal)








## `UQ112x112`






### `encode(uint112 y) → uint224 z` (internal)





### `uqdiv(uint224 x, uint112 y) → uint224 z` (internal)






