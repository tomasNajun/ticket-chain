let Ticket = artifacts.require("./Ticket.sol");

contract('Ticket', function (accounts) {
    const maxCap = 10;
    const price = 100; //wei
    const wallet = accounts[0];
    const beneficiary = accounts[1];
    const receiver = accounts[2];
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
      const burnResult = await contract.burn(amount, {from: beneficiary});
      const newBalance = await contract.balanceOf.call(beneficiary);
      assert.notEqual(initialBalance.toNumber(), newBalance.toNumber(), 'Balances are not different');
      assert.equal(newBalance.toNumber(), initialBalance.toNumber() - amount, `New ticket balance wasn't ${initialBalance.toNumber() - amount}`);

      const logs = burnResult.logs;
      const logBurn = logs[0];
      assert.lengthOf(logs, 1, "Quantity of events wasn't 1");
      assert.equal(logBurn.event, "Burn", "Event found wasn't Burn");

    });

    it('tickets available should change after buy ticket', async () => {
      const amount = 2;
      const eventMaxCap = await contract.EVENT_MAX_CAP.call();
      const totalSupply = await contract.totalSupply.call();
      const initialticketAvailable = eventMaxCap.toNumber() - totalSupply.toNumber();
      const buyTicketResult = await contract.buyTickets(beneficiary, amount, {from: beneficiary, value: amount * price});
      const newTicketAvailable = initialticketAvailable - amount;
      
      const contractTicketAvailable = await contract.ticketAvailable.call();

      assert.equal(contractTicketAvailable.toNumber(), newTicketAvailable, `Tickets availabe wasn't ${newTicketAvailable}`);
    });

    it(`Address Balance should change after ticket transfer`, async () => {
      const amount = 2;
      const transferAmount = 1;
      await contract.buyTickets(beneficiary, amount, {from: beneficiary, value: amount * price});
      const senderInitialBalance = await contract.balanceOf.call(beneficiary);
      const receiverInitialBalance = await contract.balanceOf.call(receiver);
      const transferTicketResult = await contract.transfer(receiver, transferAmount, {from: beneficiary});
      const senderNewBalance = await contract.balanceOf.call(beneficiary);
      const receiverNewBalance = await contract.balanceOf.call(receiver);

      assert.notEqual(senderInitialBalance.toNumber(), senderNewBalance.toNumber(), 'Sender Balances are not different');
      assert.notEqual(receiverInitialBalance.toNumber(), receiverNewBalance.toNumber(), 'Receiver Balances are not different');
      
      assert.equal(senderInitialBalance.toNumber() - transferAmount,  senderNewBalance.toNumber(), `New ticket balance wasn't ${senderNewBalance.toNumber()}`);
      assert.equal(receiverInitialBalance.toNumber() + transferAmount,  receiverNewBalance.toNumber(), `New ticket balance wasn't ${ receiverNewBalance.toNumber()}`);

      const transferTicketLog = transferTicketResult.logs[0];
      
      assert.equal(transferTicketLog.event, "Transfer", "Event found wasn't Transfer");

      const transferTicketLogArgs = transferTicketLog.args; 

      assert.property(transferTicketLogArgs, 'from');
      assert.property(transferTicketLogArgs, 'to');
      assert.property(transferTicketLogArgs, 'value');

      assert.equal(transferTicketLogArgs.from, beneficiary, `Address sender wasn't ${beneficiary}`);
      assert.equal(transferTicketLogArgs.to, receiver, `Address receiver wasn't ${receiver}`);
      assert.equal(transferTicketLogArgs.value.toNumber(), transferAmount, `Tickets purchased wasn't ${amount}`);
    });
});