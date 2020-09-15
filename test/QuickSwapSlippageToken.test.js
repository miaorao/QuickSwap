const { expectRevert } = require('@openzeppelin/test-helpers');
const truffleAssert = require('truffle-assertions');
const QuickSwapSlippageToken = artifacts.require('QuickSwapSlippageToken');

const TOTAL_SUPPLY = '1000'
const TEST_AMOUNT = '10'

contract('QuickSwapSlippageToken', ([alice, bob, carol, minter]) => {
    beforeEach(async () => {
        this.token = await QuickSwapSlippageToken.new(TOTAL_SUPPLY, { from: alice })
    });

    it('name, symbol, decimals, totalSupply, balanceOf, owner', async () => {
        const name = await this.token.name();
        const symbol = await this.token.symbol();
        const decimals = await this.token.decimals();
        const totalSupply = await this.token.totalSupply(); 
        const balance = await this.token.balanceOf(alice);
        assert.equal(name.valueOf(), 'Quick Swap Slippage Token');
        assert.equal(symbol.valueOf(), 'QST');
        assert.equal(decimals.valueOf(), '18');
        assert.equal(totalSupply.valueOf(), TOTAL_SUPPLY);
        assert.equal(balance.valueOf(), TOTAL_SUPPLY);
    });


    it('approve', async () => {
        let txResult = await this.token.approve(bob, TEST_AMOUNT, {from: alice});
        truffleAssert.eventEmitted(txResult, 'Approval', (ev) => {
            assert.equal(ev.owner, alice, "error owner");
            assert.equal(ev.spender, bob, "error spender");
            assert.equal(ev.value, TEST_AMOUNT, "error value");
            return true
        })

        const allowance = await this.token.allowance(alice, bob);
        assert.equal(allowance.valueOf(), TEST_AMOUNT);
    })
    
    it('transfer', async () => {
        let txResult = await this.token.transfer(bob, TEST_AMOUNT, { from: alice });
        truffleAssert.eventEmitted(txResult, 'Transfer', (ev) => {
            assert.equal(ev.from, alice, 'error from');
            assert.equal(ev.to, bob, 'error to');
            assert.equal(ev.value, TEST_AMOUNT, 'error value');
            return true
        })

        const aliceBalance = await this.token.balanceOf(alice);
        const bobBalance = await this.token.balanceOf(bob);
        assert.equal(aliceBalance.valueOf(), '990');
        assert.equal(bobBalance.valueOf(), TEST_AMOUNT);
    })

    it('transfer:fail', async () => {
        await expectRevert(
            this.token.transfer(bob, '2000', { from: alice }),
            'ds-math-sub-underflow',
        ); // ds-math-sub-underflow

        await expectRevert(
            this.token.transfer(carol, TOTAL_SUPPLY, { from: carol }),
            'ds-math-sub-underflow',
        ); // ds-math-sub-underflow
      })
    
      it('transferFrom', async () => {
        await this.token.approve(carol, TEST_AMOUNT, { from: alice });
        await this.token.transferFrom(alice, carol, TEST_AMOUNT, {from: carol});

        const allowance = await this.token.allowance(alice, carol);
        const aliceBalance = await this.token.balanceOf(alice);
        const carolBalance = await this.token.balanceOf(carol);

        assert.equal(allowance.valueOf(), '0');
        assert.equal(aliceBalance.valueOf(), '990');
        assert.equal(carolBalance.valueOf(), TEST_AMOUNT);
      })
    
      it('mint', async () => {
        let txResult = await this.token.mint(minter, TEST_AMOUNT, {from: alice});
        truffleAssert.eventEmitted(txResult, 'Transfer', (ev) => {
            assert.equal(ev.from, '0x0000000000000000000000000000000000000000', 'error from');
            assert.equal(ev.to, minter, 'error to');
            assert.equal(ev.value, TEST_AMOUNT, 'error value');
            return true
        })

        const totalSupply = await this.token.totalSupply(); 
        const balance = await this.token.balanceOf(minter);
        assert.equal(balance.valueOf(), TEST_AMOUNT);
        assert.equal(totalSupply.valueOf(), '1010');

        await expectRevert(
            this.token.mint(minter, TEST_AMOUNT, { from: minter }),
            'SlippageToken: Not Owner',
        ); // SlippageToken: Not Owner
      })
    
      it('burn', async () => {
        let txResult = await this.token.burn(alice, TEST_AMOUNT, {from: alice});
        truffleAssert.eventEmitted(txResult, 'Transfer', (ev) => {
            assert.equal(ev.from, alice, 'error from');
            assert.equal(ev.to, '0x0000000000000000000000000000000000000000', 'error to');
            assert.equal(ev.value, TEST_AMOUNT, 'error value');
            return true
        })

        const totalSupply = await this.token.totalSupply(); 
        const balance = await this.token.balanceOf(alice);
        assert.equal(balance.valueOf(), '990');
        assert.equal(totalSupply.valueOf(), '990'); 

        await expectRevert(
            this.token.burn(minter, TEST_AMOUNT, { from: minter }),
            'SlippageToken: Not Owner',
        ); // SlippageToken: Not Owner
      })
  });
