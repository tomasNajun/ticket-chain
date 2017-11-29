import React, { Component } from 'react'
import Ticket from '../../build/contracts/Ticket.json'

class CreateEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      maxCap: 0,
      price: 0
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
    const { maxCap, price } = this.state;
    const result = await this.instantiateTicketContract(this.props.web3, this.props.sender, maxCap, price);
    console.log('Result ', result);
    event.preventDefault();
  }

  instantiateTicketContract(web3, ownerAddress, maxCap, price) {
    console.log(`Creating contract with params: ${maxCap} ${price}`);
    const contract = require('truffle-contract');
    const ticket = contract(Ticket);
    ticket.setProvider(web3.currentProvider);
    const result = ticket.new([maxCap], [price], { from: this.props.sender, gas: 2000000 });
    console.log('instantiate result ', result);
    return result;
  }

  render() {
    return (
      <div>
        <h3>Create Event</h3>
        <form className="pure-form pure-form-stacked">
          <label htmlFor="maxCap">Max Cap</label>
          <input id="maxCap" name="maxCap" type="text" value={this.state.maxCap} onChange={this.handleInputChange} />
          <label htmlFor="price">Price</label>
          <input id="price" name="price" type="number" value={this.state.price} onChange={this.handleInputChange} />
          <input type="button" value="Create" onClick={this.handleSubmit} className="pure-button pure-button-primary" />
        </form>
      </div>
    );
  }

}

export default CreateEvent;