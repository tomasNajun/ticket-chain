import React, { Component } from 'react'

class BuyTicket extends Component {
  constructor(props) {
    super(props);
    console.log(this.props.sender);
    this.state = {
      quantity: 0,
      unitPrice: 0,
      beneficiary: "0x0"
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

  componentWillReceiveProps() {
    this.setState({
      beneficiary: this.props.sender
    });
  }

  handleSubmit(event) {
    const { quantity, beneficiary } = this.state;
    console.log(`Qty: ${quantity}, Beneficiary: ${beneficiary}`);
    this.buyTicket(this.props.contract, quantity, beneficiary)
      .then(function (result) {
        console.log("bought!!");
        return result;
      }).catch(function (err) {
        console.log(err.message);
      });
    
  }

  async buyTicket(ticketInstance, quantity, beneficiary) {
    const value = 1000 * quantity;
    console.log(`Value to pay: ${value}`);
    console.log(`Sender: ${this.props.sender}`);
    return ticketInstance.buyTickets(beneficiary, quantity, { from: this.props.sender, value: value });
  }

  render() {
    return (
      <div>
        <h3>Buy tickets</h3>
        <form>
          <label htmlFor="quantity">Quantity</label>
          <input id="quantity" name="quantity" type="number" value={this.state.quantity} onChange={this.handleInputChange} />
          <label htmlFor="beneficiary">Beneficiary</label>
          <input id="beneficiary" name="beneficiary" type="text" value={this.state.beneficiary} onChange={this.handleInputChange} />
          <input type="button" value="Crear" onClick={this.handleSubmit} />
        </form>
      </div>
    );
  }
}

export default BuyTicket;