import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { solidity, MockProvider, createFixtureLoader, deployContract } from 'ethereum-waffle'
import { BigNumber, bigNumberify } from 'ethers/utils'
import { expandTo18Decimals, mineBlock, encodePrice } from './shared/utilities'
import { pairFixture } from './shared/fixtures'
import { AddressZero } from 'ethers/constants'

import SlippageToken from '../build/SlippageToken.json'

const MINIMUM_LIQUIDITY = bigNumberify(10).pow(3)

chai.use(solidity)

const overrides = {
  gasLimit: 9999999
}

describe('UniswapV2Pair', () => {
  const provider = new MockProvider({
    hardfork: 'istanbul',
    mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
    gasLimit: 9999999
  })
  const [wallet, other] = provider.getWallets()
  const loadFixture = createFixtureLoader(provider, [wallet])

  let factory: Contract
  let token0: Contract
  let token1: Contract
  let tokenQLC: Contract
  let pair: Contract
  beforeEach(async () => {
    const fixture = await loadFixture(pairFixture)
    factory = fixture.factory
    token0 = fixture.token0
    token1 = fixture.token1
    tokenQLC = fixture.tokenQLC
    pair = fixture.pair
  })

  async function addLiquidity(token0Amount: BigNumber, token1Amount: BigNumber) {
    await token0.transfer(pair.address, token0Amount)
    await token1.transfer(pair.address, token1Amount)
    await pair.mint(wallet.address, overrides)
  }

  it('mint', async () => {
    const token0Amount = expandTo18Decimals(1)
    const token1Amount = expandTo18Decimals(4)
    await token0.transfer(pair.address, token0Amount)
    await token1.transfer(pair.address, token1Amount)

    const expectedLiquidity = expandTo18Decimals(2)
    await expect(pair.mint(wallet.address, overrides))
      .to.emit(pair, 'Transfer')
      .withArgs(AddressZero, AddressZero, MINIMUM_LIQUIDITY)
      .to.emit(pair, 'Transfer')
      .withArgs(AddressZero, wallet.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
      .to.emit(pair, 'Sync')
      .withArgs(token0Amount, token1Amount)
      .to.emit(pair, 'Mint')
      .withArgs(wallet.address, token0Amount, token1Amount)

    expect(await pair.totalSupply()).to.eq(expectedLiquidity)
    expect(await pair.balanceOf(wallet.address)).to.eq(expectedLiquidity.sub(MINIMUM_LIQUIDITY))
    expect(await token0.balanceOf(pair.address)).to.eq(token0Amount)
    expect(await token1.balanceOf(pair.address)).to.eq(token1Amount)
    const reserves = await pair.getReserves()
    expect(reserves[0]).to.eq(token0Amount)
    expect(reserves[1]).to.eq(token1Amount)
  })

  const swapTestCases: BigNumber[][] = [
    [1, 5, 10, '1662497915624478906'],
    [1, 10, 5, '453305446940074565'],

    [2, 5, 10, '2851015155847869602'],
    [2, 10, 5, '831248957812239453'],

    [1, 10, 10, '906610893880149131'],
    [1, 100, 100, '987158034397061298'],
    [1, 1000, 1000, '996006981039903216']
  ].map(a => a.map(n => (typeof n === 'string' ? bigNumberify(n) : expandTo18Decimals(n))))
  swapTestCases.forEach((swapTestCase, i) => {
    it(`getInputPrice:${i}`, async () => {
      const [swapAmount, token0Amount, token1Amount, expectedOutputAmount] = swapTestCase
      await addLiquidity(token0Amount, token1Amount)
      await token0.transfer(pair.address, swapAmount)
      await expect(pair.swap(0, expectedOutputAmount.add(1), wallet.address, '0x', overrides)).to.be.revertedWith(
        'UniswapV2: K'
      )
      await pair.swap(0, expectedOutputAmount, wallet.address, '0x', overrides)
    })
  })

  const optimisticTestCases: BigNumber[][] = [
    ['997000000000000000', 5, 10, 1], // given amountIn, amountOut = floor(amountIn * .997)
    ['997000000000000000', 10, 5, 1],
    ['997000000000000000', 5, 5, 1],
    [1, 5, 5, '1003009027081243732'] // given amountOut, amountIn = ceiling(amountOut / .997)
  ].map(a => a.map(n => (typeof n === 'string' ? bigNumberify(n) : expandTo18Decimals(n))))
  optimisticTestCases.forEach((optimisticTestCase, i) => {
    it(`optimistic:${i}`, async () => {
      const [outputAmount, token0Amount, token1Amount, inputAmount] = optimisticTestCase
      await addLiquidity(token0Amount, token1Amount)
      await token0.transfer(pair.address, inputAmount)
      await expect(pair.swap(outputAmount.add(1), 0, wallet.address, '0x', overrides)).to.be.revertedWith(
        'UniswapV2: K'
      )
      await pair.swap(outputAmount, 0, wallet.address, '0x', overrides)
    })
  })

  it('swap:token0', async () => {
    const token0Amount = expandTo18Decimals(5)
    const token1Amount = expandTo18Decimals(10)
    await addLiquidity(token0Amount, token1Amount)

    const swapAmount = expandTo18Decimals(1)
    const expectedOutputAmount = bigNumberify('1662497915624478906')
    await token0.transfer(pair.address, swapAmount)
    await expect(pair.swap(0, expectedOutputAmount, wallet.address, '0x', overrides))
      .to.emit(token1, 'Transfer')
      .withArgs(pair.address, wallet.address, expectedOutputAmount)
      .to.emit(pair, 'Sync')
      .withArgs(token0Amount.add(swapAmount), token1Amount.sub(expectedOutputAmount))
      .to.emit(pair, 'Swap')
      .withArgs(wallet.address, swapAmount, 0, 0, expectedOutputAmount, wallet.address)

    const reserves = await pair.getReserves()
    expect(reserves[0]).to.eq(token0Amount.add(swapAmount))
    expect(reserves[1]).to.eq(token1Amount.sub(expectedOutputAmount))
    expect(await token0.balanceOf(pair.address)).to.eq(token0Amount.add(swapAmount))
    expect(await token1.balanceOf(pair.address)).to.eq(token1Amount.sub(expectedOutputAmount))
    const totalSupplyToken0 = await token0.totalSupply()
    const totalSupplyToken1 = await token1.totalSupply()
    expect(await token0.balanceOf(wallet.address)).to.eq(totalSupplyToken0.sub(token0Amount).sub(swapAmount))
    expect(await token1.balanceOf(wallet.address)).to.eq(totalSupplyToken1.sub(token1Amount).add(expectedOutputAmount))
  })

  it('swap:token1', async () => {
    const token0Amount = expandTo18Decimals(5)
    const token1Amount = expandTo18Decimals(10)
    await addLiquidity(token0Amount, token1Amount)

    const swapAmount = expandTo18Decimals(1)
    const expectedOutputAmount = bigNumberify('453305446940074565')
    await token1.transfer(pair.address, swapAmount)
    await expect(pair.swap(expectedOutputAmount, 0, wallet.address, '0x', overrides))
      .to.emit(token0, 'Transfer')
      .withArgs(pair.address, wallet.address, expectedOutputAmount)
      .to.emit(pair, 'Sync')
      .withArgs(token0Amount.sub(expectedOutputAmount), token1Amount.add(swapAmount))
      .to.emit(pair, 'Swap')
      .withArgs(wallet.address, 0, swapAmount, expectedOutputAmount, 0, wallet.address)

    const reserves = await pair.getReserves()
    expect(reserves[0]).to.eq(token0Amount.sub(expectedOutputAmount))
    expect(reserves[1]).to.eq(token1Amount.add(swapAmount))
    expect(await token0.balanceOf(pair.address)).to.eq(token0Amount.sub(expectedOutputAmount))
    expect(await token1.balanceOf(pair.address)).to.eq(token1Amount.add(swapAmount))
    const totalSupplyToken0 = await token0.totalSupply()
    const totalSupplyToken1 = await token1.totalSupply()
    expect(await token0.balanceOf(wallet.address)).to.eq(totalSupplyToken0.sub(token0Amount).add(expectedOutputAmount))
    expect(await token1.balanceOf(wallet.address)).to.eq(totalSupplyToken1.sub(token1Amount).sub(swapAmount))
  })

  it('swap:gas', async () => {
    const token0Amount = expandTo18Decimals(5)
    const token1Amount = expandTo18Decimals(10)
    await addLiquidity(token0Amount, token1Amount)

    // ensure that setting price{0,1}CumulativeLast for the first time doesn't affect our gas math
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)
    await pair.sync(overrides)

    const swapAmount = expandTo18Decimals(1)
    const expectedOutputAmount = bigNumberify('453305446940074565')
    await token1.transfer(pair.address, swapAmount)
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)
    const tx = await pair.swap(expectedOutputAmount, 0, wallet.address, '0x', overrides)
    const receipt = await tx.wait()
    expect(receipt.gasUsed).to.eq(96749)
  })

  it('burn', async () => {
    const token0Amount = expandTo18Decimals(3)
    const token1Amount = expandTo18Decimals(3)
    const tokenQLCAmount = expandTo18Decimals(6)
    await tokenQLC.transfer(pair.address, tokenQLCAmount)
    await addLiquidity(token0Amount, token1Amount)

    expect(await tokenQLC.balanceOf(pair.address)).to.eq(tokenQLCAmount)

    const expectedLiquidity = expandTo18Decimals(3)
    await pair.transfer(pair.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
    await pair.distributeQLC()
    await expect(pair.burn(wallet.address, overrides))
      .to.emit(pair, 'Transfer')
      .withArgs(pair.address, AddressZero, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
      .to.emit(token0, 'Transfer')
      .withArgs(pair.address, wallet.address, token0Amount.sub(1000))
      .to.emit(token1, 'Transfer')
      .withArgs(pair.address, wallet.address, token1Amount.sub(1000))
      .to.emit(pair, 'Sync')
      .withArgs(1000, 1000)
      .to.emit(pair, 'Burn')
      .withArgs(wallet.address, token0Amount.sub(1000), token1Amount.sub(1000), wallet.address)

    expect(await pair.balanceOf(wallet.address)).to.eq(0)
    expect(await pair.totalSupply()).to.eq(MINIMUM_LIQUIDITY)
    expect(await token0.balanceOf(pair.address)).to.eq(1000)
    expect(await token1.balanceOf(pair.address)).to.eq(1000)
    const totalSupplyToken0 = await token0.totalSupply()
    const totalSupplyToken1 = await token1.totalSupply()
    const totalSupplyTokenQLC = await tokenQLC.totalSupply()
    expect(await tokenQLC.balanceOf(pair.address)).to.eq(MINIMUM_LIQUIDITY.add(expandTo18Decimals(3)))
    expect(await token0.balanceOf(wallet.address)).to.eq(totalSupplyToken0.sub(1000))
    expect(await token1.balanceOf(wallet.address)).to.eq(totalSupplyToken1.sub(1000))
    expect(await tokenQLC.balanceOf(wallet.address)).to.eq(totalSupplyTokenQLC.sub(1000).sub(expandTo18Decimals(3)))
  })

  it('burnStokenForUser', async () => {
    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    const tokenQLCAmount = expandTo18Decimals(6)
    const stokenAmount = bigNumberify('2367026241844072963')
    let stoken = new Contract(await pair.stoken(), JSON.stringify(SlippageToken.abi), wallet)

    await addLiquidity(token0Amount, token1Amount)
    await token0.transfer(pair.address, expandTo18Decimals(100))
    await tokenQLC.transfer(pair.address, tokenQLCAmount)

    await pair.distributeQLC()

    await pair.dealSlippageWithIn([token0.address, token1.address], expandTo18Decimals(100), wallet.address, true)
    expect(await tokenQLC.balanceOf(pair.address)).to.eq(tokenQLCAmount)
    expect(await stoken.balanceOf(pair.address)).to.eq(0)
    expect(await stoken.balanceOf(wallet.address)).to.eq(stokenAmount)

    await stoken.transfer(pair.address, stokenAmount)
    expect(await stoken.balanceOf(pair.address)).to.eq(stokenAmount)
    expect(await stoken.balanceOf(wallet.address)).to.eq(0)
    await expect(pair.burnStokenForUser(wallet.address, overrides))
      .to.emit(stoken, 'Transfer')
      .withArgs(pair.address, AddressZero, stokenAmount)

    expect(await stoken.balanceOf(pair.address)).to.eq(0)
    expect(await tokenQLC.balanceOf(stoken.address)).to.eq(0)
    const totalSupplyTokenQLC = await tokenQLC.totalSupply()
    expect(await tokenQLC.balanceOf(wallet.address)).to.eq(totalSupplyTokenQLC.sub(expandTo18Decimals(3)))
  })

  it('getAmountStokenIn', async () => {
    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    const tokenQLCAmount = expandTo18Decimals(6)
    const stokenAmount = bigNumberify('2367026241844072963')

    await addLiquidity(token0Amount, token1Amount)
    await token0.transfer(pair.address, expandTo18Decimals(100))
    await tokenQLC.transfer(pair.address, tokenQLCAmount)

    await pair.distributeQLC()

    await pair.dealSlippageWithIn([token0.address, token1.address], expandTo18Decimals(100), wallet.address, true)
    expect(await pair.getAmountStokenIn(stokenAmount)).to.eq(expandTo18Decimals(3))
  })

  it('getAmountQLCOut', async () => {
    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    const tokenQLCAmount = expandTo18Decimals(6)
    const stokenAmount = bigNumberify('2367026241844072963')

    await addLiquidity(token0Amount, token1Amount)
    await token0.transfer(pair.address, expandTo18Decimals(100))
    await tokenQLC.transfer(pair.address, tokenQLCAmount)

    await pair.distributeQLC()

    await pair.dealSlippageWithIn([token0.address, token1.address], expandTo18Decimals(100), wallet.address, true)
    expect(await pair.getAmountQLCOut(expandTo18Decimals(3))).to.eq(stokenAmount)
  })

  it('price{0,1}CumulativeLast', async () => {
    const token0Amount = expandTo18Decimals(3)
    const token1Amount = expandTo18Decimals(3)
    await addLiquidity(token0Amount, token1Amount)

    const blockTimestamp = (await pair.getReserves())[2]
    await mineBlock(provider, blockTimestamp + 1)
    await pair.sync(overrides)

    const initialPrice = encodePrice(token0Amount, token1Amount)
    expect(await pair.price0CumulativeLast()).to.eq(initialPrice[0])
    expect(await pair.price1CumulativeLast()).to.eq(initialPrice[1])
    expect((await pair.getReserves())[2]).to.eq(blockTimestamp + 1)

    const swapAmount = expandTo18Decimals(3)
    await token0.transfer(pair.address, swapAmount)
    await mineBlock(provider, blockTimestamp + 10)
    // swap to a new price eagerly instead of syncing
    await pair.swap(0, expandTo18Decimals(1), wallet.address, '0x', overrides) // make the price nice

    expect(await pair.price0CumulativeLast()).to.eq(initialPrice[0].mul(10))
    expect(await pair.price1CumulativeLast()).to.eq(initialPrice[1].mul(10))
    expect((await pair.getReserves())[2]).to.eq(blockTimestamp + 10)

    await mineBlock(provider, blockTimestamp + 20)
    await pair.sync(overrides)

    const newPrice = encodePrice(expandTo18Decimals(6), expandTo18Decimals(2))
    expect(await pair.price0CumulativeLast()).to.eq(initialPrice[0].mul(10).add(newPrice[0].mul(10)))
    expect(await pair.price1CumulativeLast()).to.eq(initialPrice[1].mul(10).add(newPrice[1].mul(10)))
    expect((await pair.getReserves())[2]).to.eq(blockTimestamp + 20)
  })

  it('feeTo:off', async () => {
    const token0Amount = expandTo18Decimals(1000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    const swapAmount = expandTo18Decimals(1)
    const expectedOutputAmount = bigNumberify('996006981039903216')
    await token1.transfer(pair.address, swapAmount)
    await pair.swap(expectedOutputAmount, 0, wallet.address, '0x', overrides)

    const expectedLiquidity = expandTo18Decimals(1000)
    await pair.transfer(pair.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
    await pair.burn(wallet.address, overrides)
    expect(await pair.totalSupply()).to.eq(MINIMUM_LIQUIDITY)
  })

  it('feeTo:on', async () => {
    await factory.setFeeTo(other.address)

    const token0Amount = expandTo18Decimals(1000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    const swapAmount = expandTo18Decimals(1)
    const expectedOutputAmount = bigNumberify('996006981039903216')
    await token1.transfer(pair.address, swapAmount)
    await pair.swap(expectedOutputAmount, 0, wallet.address, '0x', overrides)

    const expectedLiquidity = expandTo18Decimals(1000)
    await pair.transfer(pair.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
    await pair.burn(wallet.address, overrides)
    expect(await pair.totalSupply()).to.eq(MINIMUM_LIQUIDITY.add('249750499251388'))
    expect(await pair.balanceOf(other.address)).to.eq('249750499251388')

    // using 1000 here instead of the symbolic MINIMUM_LIQUIDITY because the amounts only happen to be equal...
    // ...because the initial liquidity amounts were equal
    expect(await token0.balanceOf(pair.address)).to.eq(bigNumberify(1000).add('249501683697445'))
    expect(await token1.balanceOf(pair.address)).to.eq(bigNumberify(1000).add('250000187312969'))
  })

  it('getTokenMarketPrice', async () => {
    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)
    let token0ExpectPrice = bigNumberify('2596148429267413814265248164610048') // 1/2 * 2**112
    let token1ExpectPrice = bigNumberify('10384593717069655257060992658440192') // 2 * 2**112

    expect(await pair.getTokenMarketPrice(token0.address)).to.eq(token0ExpectPrice)
    expect(await pair.getTokenMarketPrice(token1.address)).to.eq(token1ExpectPrice)

    await token0.transfer(pair.address, expandTo18Decimals(100))
    await pair.swap(0, bigNumberify('47482973758155920000'), other.address, '0x', overrides)
    expect(await pair.getTokenMarketPrice(token0.address)).to.eq(token0ExpectPrice)

    // 10 seconds passed
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 10)
    expect(await pair.getTokenMarketPrice(token0.address)).to.eq(bigNumberify('2588114135007015305964180315465795'))

    // 300 seconds passed
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 300)
    expect(await pair.getTokenMarketPrice(token0.address)).to.eq(bigNumberify('2355119601455458565233212690282467'))

    // 500 seconds passed
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 500)
    expect(await pair.getTokenMarketPrice(token0.address)).to.eq(bigNumberify('2355119601455458565233212690282467'))
  })

  it('getAmountInMarket', async () => {
    let expectedOut0 = bigNumberify('5015045135406218655')
    let expectedOut1 = bigNumberify('20060180541624874623')

    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    const resultT0 = await pair.getAmountInMarket(token0.address, expandTo18Decimals(10))
    expect(resultT0[0]).to.eq(expectedOut0)

    const resultT1 = await pair.getAmountInMarket(token1.address, expandTo18Decimals(10))
    expect(resultT1[0]).to.eq(expectedOut1)
  })

  it('getAmountOutMarket', async () => {
    let expectedOut0 = bigNumberify('4985000000000000000')
    let expectedOut1 = bigNumberify('19940000000000000000')

    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    const resultT0 = await pair.getAmountOutMarket(token0.address, expandTo18Decimals(10))
    expect(resultT0[0]).to.eq(expectedOut0)

    const resultT1 = await pair.getAmountOutMarket(token1.address, expandTo18Decimals(10))
    expect(resultT1[0]).to.eq(expectedOut1)
  })

  it('getAmountInPool', async () => {
    let expectedOut0 = bigNumberify('5015045135406218655')
    let expectedOut1 = bigNumberify('20060180541624874623')

    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    const resultT0 = await pair.getAmountInPool(token0.address, expandTo18Decimals(10))
    expect(resultT0[0]).to.eq(expectedOut0)

    const resultT1 = await pair.getAmountInPool(token1.address, expandTo18Decimals(10))
    expect(resultT1[0]).to.eq(expectedOut1)
  })

  it('getAmountOutPool', async () => {
    let expectedOut0 = bigNumberify('4985000000000000000')
    let expectedOut1 = bigNumberify('19940000000000000000')

    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    const resultT0 = await pair.getAmountOutPool(token0.address, expandTo18Decimals(10))
    expect(resultT0[0]).to.eq(expectedOut0)

    const resultT1 = await pair.getAmountOutPool(token1.address, expandTo18Decimals(10))
    expect(resultT1[0]).to.eq(expectedOut1)
  })

  it('getAmountOutFinal', async () => {
    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    expect(await pair.getAmountOutFinal(token0.address, expandTo18Decimals(100))).to.deep.eq([
      bigNumberify('47482973758155927037'),
      bigNumberify('2367026241844072963')
    ])

    await token0.transfer(pair.address, expandTo18Decimals(100))
    await pair.swap(0, bigNumberify('47482973758155920000'), other.address, '0x', overrides)

    // 30 seconds passed
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 30)
    expect(await pair.getAmountOutFinal(token1.address, bigNumberify('47482973758155927037'))).to.deep.eq([
      bigNumberify('97498790260047338676'),
      bigNumberify('2241444583194362834')
    ])

    // 120 seconds passed
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 120)
    expect(await pair.getAmountOutFinal(token1.address, bigNumberify('47482973758155927037'))).to.deep.eq([
      bigNumberify('99359704978643477633'),
      bigNumberify('2241444583194362834')
    ])
  })

  it('getAmountInFinal', async () => {
    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    expect(await pair.getAmountInFinal(token0.address, expandTo18Decimals(100))).to.deep.eq([
      bigNumberify('52789948793749670063'),
      bigNumberify('2639497439687483504')
    ])

    await token1.transfer(pair.address, bigNumberify('52789948793749670063'))
    await pair.swap(expandTo18Decimals(100), 0, other.address, '0x', overrides)

    // 30 seconds passed
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 30)
    expect(await pair.getAmountInFinal(token1.address, bigNumberify('52789948793749670063'))).to.deep.eq([
      bigNumberify('102683377404092299242'),
      bigNumberify('2795164186205328230')
    ])

    // 60 seconds passed
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 60)
    expect(await pair.getAmountInFinal(token1.address, bigNumberify('52789948793749670063'))).to.deep.eq([
      bigNumberify('101585469098888814664'),
      bigNumberify('2795164186205328230')
    ])
  })

  it('dealSlippageWithIn:common', async () => {
    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    await token0.transfer(pair.address, expandTo18Decimals(100))
    let stoken = new Contract(await pair.stoken(), JSON.stringify(SlippageToken.abi), wallet)
    await expect(
      pair.dealSlippageWithIn(
        [token0.address, token1.address, token1.address],
        expandTo18Decimals(100),
        wallet.address,
        true
      )
    ).to.be.reverted
    await expect(
      pair.dealSlippageWithIn([token0.address, token1.address], expandTo18Decimals(101), wallet.address, true)
    ).to.be.reverted
    await expect(
      pair.dealSlippageWithIn([token0.address, token1.address], expandTo18Decimals(100), wallet.address, true)
    )
      .to.emit(stoken, 'Transfer')
      .withArgs(AddressZero, wallet.address, bigNumberify('2367026241844072963'))
  })

  it('dealSlippageWithIn:arbitrager', async () => {
    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    await token0.transfer(pair.address, expandTo18Decimals(100))
    await pair.swap(0, bigNumberify('47482973758155920000'), other.address, '0x', overrides)

    await token1.transfer(pair.address, bigNumberify('47482973758155920000'))
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)

    await pair.dealSlippageWithIn(
      [token1.address, token0.address],
      bigNumberify('47482973758155920000'),
      wallet.address,
      true,
      overrides
    )
    const slippage = await pair.getSlippageAmount()
    expect(slippage[0]).to.gte(bigNumberify('2344788969412529323'))
  })

  it('dealSlippageWithIn:common gas', async () => {
    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    // ensure that setting price{0,1}CumulativeLast for the first time doesn't affect our gas math
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)
    await pair.sync(overrides)

    await token0.transfer(pair.address, expandTo18Decimals(100))
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)

    const tx = await pair.dealSlippageWithIn(
      [token0.address, token1.address],
      expandTo18Decimals(100),
      wallet.address,
      true
    )
    const receipt = await tx.wait()
    expect(receipt.gasUsed).to.eq(85908)
  })

  it('dealSlippageWithIn:common no slippage gas', async () => {
    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    // ensure that setting price{0,1}CumulativeLast for the first time doesn't affect our gas math
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)
    await pair.sync(overrides)

    await token0.transfer(pair.address, expandTo18Decimals(100))
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)

    const tx = await pair.dealSlippageWithIn(
      [token0.address, token1.address],
      expandTo18Decimals(100),
      wallet.address,
      false
    )
    const receipt = await tx.wait()
    expect(receipt.gasUsed).to.eq(35566)
  })

  it('dealSlippageWithIn:arbitrager gas', async () => {
    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    // ensure that setting price{0,1}CumulativeLast for the first time doesn't affect our gas math
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)
    await pair.sync(overrides)

    await token0.transfer(pair.address, expandTo18Decimals(100))
    await pair.swap(0, bigNumberify('47482973758155920000'), other.address, '0x', overrides)
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)

    await token1.transfer(pair.address, bigNumberify('47482973758155920000'))
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)

    const tx = await pair.dealSlippageWithIn(
      [token1.address, token0.address],
      bigNumberify('47482973758155920000'),
      wallet.address,
      true
    )
    const receipt = await tx.wait()
    expect(receipt.gasUsed).to.eq(108329)
  })

  it('dealSlippageWithIn:arbitrager no slippage gas', async () => {
    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    // ensure that setting price{0,1}CumulativeLast for the first time doesn't affect our gas math
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)
    await pair.sync(overrides)

    await token0.transfer(pair.address, expandTo18Decimals(100))
    await pair.swap(0, bigNumberify('47482973758155920000'), other.address, '0x', overrides)
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)

    await token1.transfer(pair.address, bigNumberify('47482973758155920000'))
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)

    const tx = await pair.dealSlippageWithIn(
      [token1.address, token0.address],
      bigNumberify('47482973758155920000'),
      wallet.address,
      false
    )
    const receipt = await tx.wait()
    expect(receipt.gasUsed).to.eq(57848)
  })

  it('dealSlippageWithOut:common', async () => {
    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    let stoken = new Contract(await pair.stoken(), JSON.stringify(SlippageToken.abi), wallet)

    await expect(
      pair.dealSlippageWithOut([token1.address, token0.address], expandTo18Decimals(100), wallet.address, true)
    )
      .to.emit(stoken, 'Transfer')
      .withArgs(AddressZero, wallet.address, bigNumberify('2639497439687483504'))
  })

  it('dealSlippageWithOut:arbitrager', async () => {
    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    await token1.transfer(pair.address, bigNumberify('52789948793749670063'))
    await pair.swap(expandTo18Decimals(100), 0, other.address, '0x', overrides)
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)

    await pair.dealSlippageWithOut(
      [token0.address, token1.address],
      bigNumberify('52789948793749670063'),
      wallet.address,
      true,
      overrides
    )
    const slippage = await pair.getSlippageAmount()
    expect(slippage[0]).to.lte(bigNumberify('2628349788129130753'))
  })

  it('dealSlippageWithOut:common gas', async () => {
    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    // ensure that setting price{0,1}CumulativeLast for the first time doesn't affect our gas math
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)
    await pair.sync(overrides)

    const tx = await pair.dealSlippageWithOut(
      [token0.address, token1.address],
      expandTo18Decimals(100),
      wallet.address,
      true
    )
    const receipt = await tx.wait()
    expect(receipt.gasUsed).to.eq(83121)
  })

  it('dealSlippageWithOut:common no slippage gas', async () => {
    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    // ensure that setting price{0,1}CumulativeLast for the first time doesn't affect our gas math
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)
    await pair.sync(overrides)

    const tx = await pair.dealSlippageWithOut(
      [token0.address, token1.address],
      expandTo18Decimals(100),
      wallet.address,
      false
    )
    const receipt = await tx.wait()
    expect(receipt.gasUsed).to.eq(32647)
  })

  it('dealSlippageWithOut:arbitrager gas', async () => {
    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    // ensure that setting price{0,1}CumulativeLast for the first time doesn't affect our gas math
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)
    await pair.sync(overrides)

    await token1.transfer(pair.address, bigNumberify('52789948793749670063'))
    await pair.swap(expandTo18Decimals(100), 0, other.address, '0x', overrides)
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)

    const tx = await pair.dealSlippageWithOut(
      [token0.address, token1.address],
      bigNumberify('52789948793749670063'),
      wallet.address,
      true
    )
    const receipt = await tx.wait()
    expect(receipt.gasUsed).to.eq(105330)
  })

  it('dealSlippageWithOut:arbitrager no slippage gas', async () => {
    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    // ensure that setting price{0,1}CumulativeLast for the first time doesn't affect our gas math
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)
    await pair.sync(overrides)

    await token1.transfer(pair.address, bigNumberify('52789948793749670063'))
    await pair.swap(expandTo18Decimals(100), 0, other.address, '0x', overrides)
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)

    const tx = await pair.dealSlippageWithOut(
      [token0.address, token1.address],
      bigNumberify('52789948793749670063'),
      wallet.address,
      false
    )
    const receipt = await tx.wait()
    expect(receipt.gasUsed).to.eq(54856)
  })

  it('approveSlippageToken', async () => {
    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    await token0.transfer(pair.address, expandTo18Decimals(100))
    await pair.swap(0, bigNumberify('47482973758155920000'), other.address, '0x', overrides)

    await token1.transfer(pair.address, bigNumberify('47482973758155920000'))
    await pair.dealSlippageWithIn(
      [token1.address, token0.address],
      bigNumberify('47482973758155920000'),
      wallet.address,
      overrides
    )

    await pair.approveSlippageToken(wallet.address, overrides)
    expect(await token0.allowance(pair.address, wallet.address)).to.gte(bigNumberify('2344788969412529323'))
    expect(await token1.allowance(pair.address, wallet.address)).to.eq('0')
  })

  it('approveSlippageToken: gas', async () => {
    const token0Amount = expandTo18Decimals(2000)
    const token1Amount = expandTo18Decimals(1000)
    await addLiquidity(token0Amount, token1Amount)

    await token0.transfer(pair.address, expandTo18Decimals(100))
    await pair.swap(0, bigNumberify('47482973758155920000'), other.address, '0x', overrides)

    await token1.transfer(pair.address, bigNumberify('47482973758155920000'))
    await pair.dealSlippageWithIn(
      [token1.address, token0.address],
      bigNumberify('47482973758155920000'),
      wallet.address,
      overrides
    )

    // ensure that setting price{0,1}CumulativeLast for the first time doesn't affect our gas math
    await mineBlock(provider, (await provider.getBlock('latest')).timestamp + 1)
    await pair.sync(overrides)

    const tx = await pair.approveSlippageToken(wallet.address, overrides)
    const receipt = await tx.wait()
    expect(receipt.gasUsed).to.eq(51113)
  })
})
