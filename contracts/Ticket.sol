pragma solidity ^0.4.4;

import 'zeppelin-solidity/contracts/token/BurnableToken.sol';

contract Ticket is BurnableToken {

	// mapping (address => uint) ticketRecordBook; I used 'balances' because function burn() in BurnableToken use that mapping
  uint public soldTickets;
  uint EVENT_MAX_CAP;
	uint256 public price;
	// address where funds are collected
  address public wallet;

	// event Transfer(address indexed _from, address indexed _to, uint256 _qtty); This event already exist in this contract because it is BurnableToken -> StandardToken -> BasicToken -> ERC20Basic 

	//Constructor
	function Ticket(uint maxCap, uint256 _price, address _wallet) {
		require(maxCap > 0);
		require(_price > 0);
		require(_wallet != address(0));
		
		EVENT_MAX_CAP = maxCap;
		price = _price;
		wallet = _wallet;
	}

  event LogPurchase(address indexed _from, address indexed beneficiary, uint256 _qtty);
  
	function buyTickets(address beneficiary, uint256 amount) public payable returns (bool sufficient) {
		require(beneficiary != address(0));
		// TODO isn't it a race condition?
    require(soldTickets + amount <= EVENT_MAX_CAP); 
		uint256 weiAmount = msg.value;
		uint256 weiTotal = amount.mul(price);
		require(weiAmount == weiTotal);

		balances[beneficiary] = balances[beneficiary].add(amount);
		soldTickets += amount;

    LogPurchase(msg.sender, beneficiary, amount);

		if (!forwardFunds())
			revert();
		
		return true;
  }

	// send ether to the fund collection wallet
  function forwardFunds() internal returns (bool success) {
    wallet.transfer(msg.value);
		return true;
  }

	// This method exixts in BasicToken
	// function sendTicket(address receiver, uint amount) public returns(bool sufficient) {
	// 	if (ticketRecordBook[msg.sender] < amount)
  //     return false;
	// 	ticketRecordBook[msg.sender] -= amount;
	// 	ticketRecordBook[receiver] += amount;

	// 	Transfer(msg.sender, receiver, amount);
	// 	return true;
	// }

	// This function exists as "balanceOf(address who)" in ERC20Basic contract
	// function getBalance(address addr) returns(uint) { 
	// 	return ticketRecordBook[addr];
	// }

}
