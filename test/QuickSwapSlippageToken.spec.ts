import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { MaxUint256 } from 'ethers/constants'
import { solidity, MockProvider, deployContract } from 'ethereum-waffle'
import { expandTo18Decimals, getApprovalDigest } from './shared/utilities'
import { AddressZero } from 'ethers/constants'

import SlippageToken from '../build/SlippageToken.json'

chai.use(solidity)

const TOTAL_SUPPLY = expandTo18Decimals(10000)
const TEST_AMOUNT = expandTo18Decimals(10)

describe('QuickSwapSlippageToken', () => {
  const provider = new MockProvider({
    hardfork: 'istanbul',
    mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
    gasLimit: 9999999
  })
  const [wallet, other] = provider.getWallets()

  let token: Contract
  beforeEach(async () => {
    token = await deployContract(wallet, SlippageToken, [TOTAL_SUPPLY])
  })

  it('name, symbol, decimals, totalSupply, balanceOf, owner', async () => {
    const name = await token.name()
    expect(name).to.eq('Quick Swap Slippage Token')
    expect(await token.symbol()).to.eq('QST')
    expect(await token.decimals()).to.eq(18)
    expect(await token.totalSupply()).to.eq(TOTAL_SUPPLY)
    expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY)
  })

  it('approve', async () => {
    await expect(token.approve(other.address, TEST_AMOUNT))
      .to.emit(token, 'Approval')
      .withArgs(wallet.address, other.address, TEST_AMOUNT)
    expect(await token.allowance(wallet.address, other.address)).to.eq(TEST_AMOUNT)
  })

  it('transfer', async () => {
    await expect(token.transfer(other.address, TEST_AMOUNT))
      .to.emit(token, 'Transfer')
      .withArgs(wallet.address, other.address, TEST_AMOUNT)
    expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY.sub(TEST_AMOUNT))
    expect(await token.balanceOf(other.address)).to.eq(TEST_AMOUNT)
  })

  it('transfer:fail', async () => {
    await expect(token.transfer(other.address, TOTAL_SUPPLY.add(1))).to.be.reverted // ds-math-sub-underflow
    await expect(token.connect(other).transfer(wallet.address, 1)).to.be.reverted // ds-math-sub-underflow
  })

  it('transferFrom', async () => {
    await token.approve(other.address, TEST_AMOUNT)
    await expect(token.connect(other).transferFrom(wallet.address, other.address, TEST_AMOUNT))
      .to.emit(token, 'Transfer')
      .withArgs(wallet.address, other.address, TEST_AMOUNT)
    expect(await token.allowance(wallet.address, other.address)).to.eq(0)
    expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY.sub(TEST_AMOUNT))
    expect(await token.balanceOf(other.address)).to.eq(TEST_AMOUNT)
  })

  it('transferFrom:max', async () => {
    await token.approve(other.address, MaxUint256)
    await expect(token.connect(other).transferFrom(wallet.address, other.address, TEST_AMOUNT))
      .to.emit(token, 'Transfer')
      .withArgs(wallet.address, other.address, TEST_AMOUNT)
    expect(await token.allowance(wallet.address, other.address)).to.eq(MaxUint256)
    expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY.sub(TEST_AMOUNT))
    expect(await token.balanceOf(other.address)).to.eq(TEST_AMOUNT)
  })

  it('mint', async () => {
    await expect(token.mint(other.address, TEST_AMOUNT))
      .to.emit(token, 'Transfer')
      .withArgs(AddressZero, other.address, TEST_AMOUNT)
    expect(await token.balanceOf(other.address)).to.eq(TEST_AMOUNT)
    await expect(token.connect(other).mint(wallet.address, TEST_AMOUNT)).to.be.reverted
  })

  it('burn', async () => {
    await expect(token.burn(wallet.address, TEST_AMOUNT))
      .to.emit(token, 'Transfer')
      .withArgs(wallet.address, AddressZero, TEST_AMOUNT)
    expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY.sub(TEST_AMOUNT))
    await expect(token.connect(other).burn(wallet.address, TEST_AMOUNT)).to.be.reverted
  })
})
