let Ticket = artifacts.require("./Ticket.sol");

contract('Ticket', function (accounts) {
    const maxCap = 10;
    const price = 100; //wei
    const wallet = accounts[0];
    const beneficiary = accounts[1];
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
        const amount = 2;
        const initialBalance = await contract.balanceOf.call(beneficiary);
        const buyTicketResult = await contract.buyTickets(beneficiary, amount, {from: beneficiary, value: amount * price});
        const newBalance = await contract.balanceOf.call(beneficiary);
        assert.notEqual(initialBalance.toNumber(), newBalance.toNumber(), 'Balances are not different');
        assert.equal(newBalance.toNumber(), amount, `New ticket balance wasn't ${amount}`);

        const logs = buyTicketResult.logs;
        const logPurchase = logs[5];
        assert.lengthOf(logs, 6, "Quantity of events wasn't 1");
        assert.equal(logPurchase.event, "LogPurchase", "Event found wasn't LogPurchase");

        const logPurchaseArgs = logPurchase.args; 
        assert.property(logPurchaseArgs, '_from');
        assert.property(logPurchaseArgs, 'beneficiary');
        assert.property(logPurchaseArgs, '_qtty');

        assert.equal(logPurchaseArgs._from, beneficiary, `Address sender wasn't ${beneficiary}`);
        assert.equal(logPurchaseArgs.beneficiary, beneficiary, `Address beneficiary wasn't ${beneficiary}`);
        assert.equal(logPurchaseArgs._qtty, amount, `Tickets purchased wasn't ${amount}`);
      });

      it(`Address Balance should change after ticket burn`, async () => {
        const amount = 1;
        const initialBalance = await contract.balanceOf.call(beneficiary);
        console.log(initialBalance);
        const burnResult = await contract.burn(amount, {from: beneficiary});
        const newBalance = await contract.balanceOf.call(beneficiary);
        assert.notEqual(initialBalance.toNumber(), newBalance.toNumber(), 'Balances are not different');
        assert.equal(newBalance.toNumber(), initialBalance.toNumber() - amount, `New ticket balance wasn't ${initialBalance.toNumber() - amount}`);

        const logs = burnResult.logs;
        const logBurn = logs[0];
        assert.lengthOf(logs, 1, "Quantity of events wasn't 1");
        assert.equal(logBurn.event, "Burn", "Event found wasn't Burn");

      });

});