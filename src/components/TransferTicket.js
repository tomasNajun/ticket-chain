import React, { Component } from 'react'
import Ticket from '../../build/contracts/Ticket.json'

class TransferTicket extends Component {
  constructor(props) {
    super(props);

    this.state = {
      quantity: 0,
      unitPrice: 0,
      receiver: "0x0",
      sender: "0x0"
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleSubmit(event) {
    const { quantity, receiver } = this.state;
    console.log(`Qty: ${quantity}, receiver: ${receiver}`);
    this.transferTicket(this.props.web3, quantity, receiver)
      .then(function (result) {
        console.log("Transfered Successfully!!", result);
        return result;
      }).catch(function (err) {
        console.log('Oops, we got an error!', err, err.message);
      });
  }

  async transferTicket(web3, quantity, receiver) {
    const contract = require('truffle-contract');
    const ticket = contract(Ticket);
    ticket.setProvider(web3.currentProvider);
    const ticketInstance = await ticket.deployed();
    console.log(`Contract at: ${ticketInstance.address}`);
    console.log(`Quantity to transfer: ${quantity}`);
    console.log(`Sender: ${this.props.sender}`);

    return ticketInstance.transfer(receiver, quantity, { from: this.state.sender });
  }

  componentWillReceiveProps() {
    if (this.props.sender) {
      this.setState({
        sender: this.props.sender
      });
    }
  }

  render() {
    return (
      <div>
        <h3>Transfer Tickets</h3>
        <form>
          <label htmlFor="sender">Sender</label>
          <input id="sender" name="sender" type="text" value={this.state.sender} onChange={this.handleInputChange} />
          <label htmlFor="quantity">Quantity</label>
          <input id="quantity" name="quantity" type="number" value={this.state.quantity} onChange={this.handleInputChange} />
          <label htmlFor="receiver">Receiver</label>
          <input id="receiver" name="receiver" type="text" value={this.state.receiver} onChange={this.handleInputChange} />
          <input type="button" value="Transfer" onClick={this.handleSubmit} />
        </form>
      </div>
    );
  }
}

export default TransferTicket;