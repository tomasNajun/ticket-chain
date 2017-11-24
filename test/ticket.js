let Ticket = artifacts.require("./Ticket.sol");

contract('Ticket', function (accounts) {
    const maxCap = 10;
    const price = 100; //wei
    const wallet = accounts[1];
    const beneficiary = accounts[2];
    const creator = accounts[0];
    let contract;

    before(async () => {
        contract = await Ticket.new(maxCap, price, wallet);
    })

    it(`should initialize contract maxCap, price and wallet`, async () => {
        const contractMaxCap = await contract.EVENT_MAX_CAP(); 
        const contractPrice = await contract.price();
        const contractWallet = await contract.wallet(); 
        
        assert.equal(contractMaxCap, maxCap, `The maxCap val wasn't ${maxCap}`);
        assert.equal(contractPrice, price, `The price val wasn't ${price}`);
        assert.equal(contractWallet, wallet, `The wallet address val wasn't ${wallet}`);
      });

      it(`Address Balance should change after ticket purchase`, async () => {
        await contract.buyTickets(beneficiary, 2) 
        const res = await contract.getBalances.call(beneficiary);
        console.log('res', res);
      });

});