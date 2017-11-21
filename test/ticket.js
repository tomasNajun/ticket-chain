let Ticket = artifacts.require("./Ticket.sol");

contract('SimpleStorage', function (accounts) {

    it(`should initialize contract maxCap, price and wallet`, async function () {
        const maxCap = 10;
        const price = 100; //wei
        const wallet = accounts[1];
        const creator = accounts[0];
        const contract = await Ticket.new(maxCap, price, wallet);

        const contractMaxCap = await contract.EVENT_MAX_CAP(); 
        const contractPrice = await contract.price();
        const contractWallet = await contract.wallet(); 
        
        assert.equal(contractMaxCap, maxCap, `The maxCap val wasn't ${maxCap}`);
        assert.equal(contractPrice, price, `The price val wasn't ${price}`);
        assert.equal(contractWallet, wallet, `The wallet address val wasn't ${wallet}`);
      });
});