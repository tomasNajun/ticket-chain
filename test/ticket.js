let Ticket = artifacts.require("./Ticket.sol");

contract('SimpleStorage', function (accounts) {

    const maxCap = 10;
    const price = 100; //wei
    const wallet = accounts[1];
    let contract;

    before( async function() {
        // runs before all tests in this block
        contract = await Ticket.new(maxCap, price, wallet);
    });


    it(`should initialize contract maxCap, price and wallet`, async function () {
        const contractMaxCap = await contract.EVENT_MAX_CAP(); 
        const contractPrice = await contract.price();
        const contractWallet = await contract.wallet(); 
        
        assert.equal(contractMaxCap, maxCap, `The maxCap val wasn't ${maxCap}`);
        assert.equal(contractPrice, price, `The price val wasn't ${price}`);
        assert.equal(contractWallet, wallet, `The wallet address val wasn't ${wallet}`);
    });

    it('Test buy ticket', async function () {
        const beneficiary = accounts[1];
        const amount = 1;

        contract.buyTickets(beneficiary, amount)
    });
});