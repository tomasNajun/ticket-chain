pragma solidity ^0.4.4;

import 'zeppelin-solidity/contracts/token/BurnableToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Ticket is BurnableToken, Ownable {

  uint public EVENT_MAX_CAP;
  uint public soldTickets;
	uint256 public price;

	event LogTicket(uint maxCap, uint256 _price);
	event Logger(uint description);
	
	//Constructor
	function Ticket(uint maxCap, uint256 _price) {
		Logger(1);
		require(maxCap > 0);
		Logger(2);
		require(_price > 0);
		Logger(3);
		
		EVENT_MAX_CAP = maxCap;
		price = _price;
		totalSupply = maxCap;
		LogTicket(maxCap, _price);
	}

  event LogPurchase(address indexed _from, address indexed beneficiary, uint256 _qtty);
  
	function buyTickets(address beneficiary, uint256 amount) public payable returns (bool sufficient) {
		Logger(1);
		if (beneficiary == address(0))
		  return false;
		Logger(2);
    if (soldTickets + amount > EVENT_MAX_CAP)
			return false; 
		Logger(3);
		uint256 weiAmount = msg.value;
		uint256 weiTotal = amount.mul(price);
		Logger(4);
		if (weiAmount != weiTotal)
			return false;
		Logger(5);

		balances[beneficiary] = balances[beneficiary].add(amount);
		soldTickets += amount;

    LogPurchase(msg.sender, beneficiary, amount);

		return true;
  }

	function ticketAvailable() public constant returns (uint256 _ticketAvailable) {
		return EVENT_MAX_CAP.sub(soldTickets);
	}

	event Refund(address _recipient, uint _amount, uint _valueRefunded);

	function refundTicket(address recipient, uint amount) public onlyOwner returns (bool success) {
		require(balances[recipient] >= amount);
		uint valueToRefund = amount.mul(price);
		require(this.balance >= valueToRefund);
		balances[recipient] = balances[recipient].sub(amount);
		soldTickets -= amount;
		recipient.transfer(valueToRefund);
		Refund(recipient, amount, valueToRefund);
		return true;
	}
}
