import React, { Component } from 'react'
import Ticket from '../../build/contracts/Ticket.json'

class CreateEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      maxCap: 0,
      price: 0,
      address: "0x0"
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

  async handleSubmit(event) {
    // alert('A name was submitted: ' + this.state.value);
    const { maxCap, price, address } = this.state;
    await this.instantiateTicketContract(this.props.web3, address, maxCap, price, address);
    event.preventDefault();
  }

  async instantiateTicketContract(web3, ownerAddress, maxCap, price, walletAddress) {
    console.log(`Creating contract with params: ${ownerAddress} ${maxCap} ${price} ${walletAddress}`);
    const contract = require('truffle-contract');
    const ticket = contract(Ticket);
    ticket.setProvider(web3.currentProvider);
    const result = await ticket.new([maxCap, price, walletAddress], { from: ownerAddress, gas: 2000000 });
    return result;
  }

  render() {
    return (
      <div>
        <h3>Create Event</h3>
        <form>
          <label htmlFor="maxCap">Max Cap</label>
          <input id="maxCap" name="maxCap" type="text" value={this.state.maxCap} onChange={this.handleInputChange} />
          <label htmlFor="price">Price</label>
          <input id="price" name="price" type="number" value={this.state.price} onChange={this.handleInputChange} />
          <label htmlFor="address">Fund wallet address</label>
          <input id="address" name="address" type="text" value={this.state.address} onChange={this.handleInputChange} />
          <input type="button" value="Create" onClick={this.handleSubmit} />
        </form>
      </div>
    );
  }

}

export default CreateEvent;