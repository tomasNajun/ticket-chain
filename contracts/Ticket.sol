pragma solidity ^0.4.4;

import 'zeppelin-solidity/contracts/token/BurnableToken.sol';

contract Ticket is BurnableToken {
	mapping (address => uint) ticketRecordBook;
  uint soldTickets;
  uint EVENT_MAX_CAP;

	event Transfer(address indexed _from, address indexed _to, uint256 _qtty);
  event Purchase(address indexed _from, uint256 _qtty);

	function init(uint maxCap) {
    EVENT_MAX_CAP = maxCap;
	}

  function buyTickets(uint amount) returns (bool sufficient) {
    if (soldTickets == EVENT_MAX_CAP) 
      return false;
    ticketRecordBook[msg.sender] += amount;
    Purchase(msg.sender, amount);
  }

	function sendTicket(address receiver, uint amount) returns(bool sufficient) {
		if (ticketRecordBook[msg.sender] < amount)
      return false;
		ticketRecordBook[msg.sender] -= amount;
		ticketRecordBook[receiver] += amount;
		Transfer(msg.sender, receiver, amount);
		return true;
	}

	function getBalance(address addr) returns(uint) {
		return ticketRecordBook[addr];
	}
  
}
