pragma solidity ^0.4.4;

import 'zeppelin-solidity/contracts/token/BurnableToken.sol';

contract Ticket is BurnableToken {

	// mapping (address => uint) ticketRecordBook; I used 'balances' because function burn() in BurnableToken use that mapping
  uint public EVENT_MAX_CAP;
	uint256 public price;
	// address where funds are collected
  address public wallet;

	// event Transfer(address indexed _from, address indexed _to, uint256 _qtty); This event already exist in this contract because it is BurnableToken -> StandardToken -> BasicToken -> ERC20Basic 

	event LogTicket(uint maxCap, uint256 _price, address _wallet);
	event Logger(uint description);
	//Constructor
	function Ticket(uint maxCap, uint256 _price, address _wallet) {
		Logger(1);
		require(maxCap > 0);
		Logger(2);
		require(_price > 0);
		Logger(3);
		require(_wallet != address(0));
		Logger(4);
		
		EVENT_MAX_CAP = maxCap;
		price = _price;
		wallet = _wallet;
		LogTicket(maxCap, _price, _wallet);
	}

  event LogPurchase(address indexed _from, address indexed beneficiary, uint256 _qtty);
  
	function buyTickets(address beneficiary, uint256 amount) public payable returns (bool sufficient) {
		Logger(1);
		if (beneficiary == address(0))
		  return false;
		Logger(2);
    if (totalSupply + amount > EVENT_MAX_CAP)
			return false; 
		Logger(3);
		uint256 weiAmount = msg.value;
		uint256 weiTotal = amount.mul(price);
		Logger(4);
		if (weiAmount != weiTotal)
			return false;
		Logger(5);

		balances[beneficiary] = balances[beneficiary].add(amount);
		totalSupply += amount;

    LogPurchase(msg.sender, beneficiary, amount);

		forwardFunds();
		
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
