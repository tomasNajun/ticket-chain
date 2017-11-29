let Ticket = artifacts.require("./Ticket.sol");

contract('Ticket', function (accounts) {
  const maxCap = 10;
  const price = 100; //wei
  const beneficiary = accounts[1];
  const receiver = accounts[2];
  let contract;

  before(async () => {
    contract = await Ticket.new(maxCap, price);
  })

  it('should initialize contract maxCap and price', async () => {
    const contractMaxCap = await contract.EVENT_MAX_CAP();
    const totalSupply = await contract.totalSupply();
    const contractPrice = await contract.price();
    assert.equal(contractMaxCap, maxCap, `The maxCap val wasn't ${maxCap}`);
    assert.equal(totalSupply, maxCap, `The maxCap val wasn't ${maxCap}`);
    assert.equal(contractPrice, price, `The price val wasn't ${price}`);
  });

  it(`Address Balance should change after ticket purchase`, async () => {
    const amount = 2;
    const initialBalance = await contract.balanceOf.call(beneficiary);
    const initialContractWeiBalance = await web3.eth.getBalance(contract.address);
    const valueToPay = amount * price;
    const buyTicketResult = await contract.buyTickets(beneficiary, amount, { from: beneficiary, value: valueToPay });
    const newBalance = await contract.balanceOf.call(beneficiary);
    assert.notEqual(initialBalance.toNumber(), newBalance.toNumber(), 'Balances are not different');
    assert.equal(newBalance.toNumber(), amount, `New ticket balance wasn't ${amount}`);

    const newContractWeiBalance = await web3.eth.getBalance(contract.address);
    const weiBalance = initialContractWeiBalance.toNumber() + valueToPay;
    assert.equal(newContractWeiBalance.toNumber(), weiBalance, `Contract wei balance wasn't ${weiBalance}`)
    const logs = buyTicketResult.logs;
    const logPurchase = logs[0];
    assert.lengthOf(logs, 1, "Quantity of events wasn't 1");
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
    const burnResult = await contract.burn(amount, { from: beneficiary });
    const newBalance = await contract.balanceOf.call(beneficiary);
    assert.notEqual(initialBalance.toNumber(), newBalance.toNumber(), 'Balances are not different');
    assert.equal(newBalance.toNumber(), initialBalance.toNumber() - amount, `New ticket balance wasn't ${initialBalance.toNumber() - amount}`);

    const logs = burnResult.logs;
    const logBurn = logs[0];
    assert.lengthOf(logs, 1, "Quantity of events wasn't 1");
    assert.equal(logBurn.event, "Burn", "Event found wasn't Burn");

  });

  it('tickets available should change after bought ticket', async () => {
    const amount = 2;
    const eventMaxCap = await contract.EVENT_MAX_CAP.call();
    const soldTickets = await contract.soldTickets.call();
    const initialticketAvailable = eventMaxCap.toNumber() - soldTickets.toNumber();
    const buyTicketResult = await contract.buyTickets(beneficiary, amount, { from: beneficiary, value: amount * price });
    const newTicketAvailable = initialticketAvailable - amount;

    const contractTicketAvailable = await contract.ticketAvailable.call();

    assert.equal(contractTicketAvailable.toNumber(), newTicketAvailable, `Tickets availabe wasn't ${newTicketAvailable}`);
  });

  it('tickets available should increase and contract wei balance should decrease after refund', async () => {
    const amount = 2;
    const initialBalance = await contract.balanceOf.call(beneficiary);
    const initialContractWeiBalance = await web3.eth.getBalance(contract.address);
    const initialSoldTickets = await contract.soldTickets.call();
    const valueToPay = amount * price;
    const buyTicketResult = await contract.buyTickets(beneficiary, amount, { from: beneficiary, value: valueToPay });
    const refund = await contract.refundTicket(beneficiary, amount);
    const newBalance = await contract.balanceOf.call(beneficiary);
    const newContractWeiBalance = await web3.eth.getBalance(contract.address);
    const newWeiBalance = initialContractWeiBalance.toNumber() + valueToPay;
    const newSoldTickets = await contract.soldTickets.call();
    assert.equal(newBalance.toNumber(), initialBalance, `New ticket balance wasn't ${initialBalance}`);
    assert.equal(newContractWeiBalance.toNumber(), initialContractWeiBalance, `New ticket balance wasn't ${initialContractWeiBalance}`);
    assert.equal(newSoldTickets.toNumber(), initialSoldTickets.toNumber(), `New total supply wasn't ${initialSoldTickets.toNumber()}`);

    const refundEvent = refund.logs[0];
    assert.lengthOf(refund.logs, 1, "Quantity of events wasn't 1");
    assert.equal(refundEvent.event, "Refund", "Event found wasn't Refund");

    const args = refundEvent.args;
    assert.property(args, '_recipient');
    assert.property(args, '_amount');
    assert.property(args, '_valueRefunded');

    assert.equal(args._recipient, beneficiary, `Recipient wasn't ${beneficiary}`);
    assert.equal(args._amount, amount, `Amount wasn't ${amount}`);
    assert.equal(args._valueRefunded, valueToPay, `Value to be refunded wasn't ${valueToPay}`);

  });

  it(`Address Balance should change after ticket transfer`, async () => {
    const amount = 2;
    const transferAmount = 1;
    await contract.buyTickets(beneficiary, amount, { from: beneficiary, value: amount * price });
    const senderInitialBalance = await contract.balanceOf.call(beneficiary);
    const receiverInitialBalance = await contract.balanceOf.call(receiver);
    const transferTicketResult = await contract.transfer(receiver, transferAmount, { from: beneficiary });
    const senderNewBalance = await contract.balanceOf.call(beneficiary);
    const receiverNewBalance = await contract.balanceOf.call(receiver);

    assert.notEqual(senderInitialBalance.toNumber(), senderNewBalance.toNumber(), 'Sender Balances are not different');
    assert.notEqual(receiverInitialBalance.toNumber(), receiverNewBalance.toNumber(), 'Receiver Balances are not different');

    assert.equal(senderInitialBalance.toNumber() - transferAmount, senderNewBalance.toNumber(), `New ticket balance wasn't ${senderNewBalance.toNumber()}`);
    assert.equal(receiverInitialBalance.toNumber() + transferAmount, receiverNewBalance.toNumber(), `New ticket balance wasn't ${receiverNewBalance.toNumber()}`);

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