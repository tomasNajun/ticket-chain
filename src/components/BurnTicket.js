import React, { Component } from 'react'
import Ticket from '../../build/contracts/Ticket.json'

class BurnTicket extends Component {
  constructor(props) {
    super(props);

    this.state = {
      quantity: 0,
      unitPrice: 0,
      owner: "0x0"
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
    const { quantity, owner } = this.state;
    console.log(`Qty: ${quantity}, owner: ${owner}`);
    this.burnTicket(this.props.web3, quantity, owner)
      .then(function (result) {
        console.log("Burned!!", result);
        return result;
      }).catch(function (err) {
        console.log('Se rompió todo!', err, err.message);
      });
  }

  async burnTicket(web3, quantity, owner) {
    const contract = require('truffle-contract');
    const ticket = contract(Ticket);
    ticket.setProvider(web3.currentProvider);
    const ticketInstance = await ticket.deployed();
    console.log(`Contract at: ${ticketInstance.address}`);
    console.log(`Quantity to burn: ${quantity}`);
    console.log(`Sender: ${this.props.sender}`);

    return ticketInstance.burn(quantity, { from: this.props.sender });
  }

  render() {
    return (
      <div>
        <h3>Burn tickets</h3>
        <form>
          <label htmlFor="quantity">Quantity</label>
          <input id="quantity" name="quantity" type="number" value={this.state.quantity} onChange={this.handleInputChange} />
          <label htmlFor="owner">Owner</label>
          <input id="owner" name="owner" type="text" value={this.state.owner} onChange={this.handleInputChange} />
          <input type="button" value="Crear" onClick={this.handleSubmit} />
        </form>
      </div>
    );
  }
}

export default BurnTicket;