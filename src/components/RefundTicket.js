import React, { Component } from 'react'

class RefundTicket extends Component {
  constructor(props) {
    super(props);

    this.state = {
      quantity: 0,
      recipient: "0x0"
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
    const { quantity, recipient } = this.state;
    console.log(`Qty: ${quantity}, receiver: ${recipient}`);
    this.refundTickets(this.props.contract, recipient, quantity)
      .then(function (result) {
        console.log("Refund Successfully!!", result);
        return result;
      }).catch(function (err) {
        console.log('Oops, we got an error!', err, err.message);
      });
  }

  async refundTickets(ticketInstance, recipient, quantity) {
    return ticketInstance.refundTicket(recipient, quantity, {from: this.props.sender});
  }

  async getContractData(ticketInstance) {
    const ticketPrice = await ticketInstance.price.call();
    const ticketAvailable = await ticketInstance.ticketAvailable.call();
    return {
      unitPrice: ticketPrice.toNumber(),
      ticketAvailable: ticketAvailable.toNumber()
    };
  }

  componentWillReceiveProps() {
    if (this.props.sender) {
      this.setState({
        recipient: this.props.sender
      });
    }
  }

  render() {
    return (
      <div>
        <h3>Refund Tickets</h3>
        <form>
          <label htmlFor="recipient">Recipent</label>
          <input id="recipient" name="recipient" type="text" value={this.state.recipient} onChange={this.handleInputChange} />
          <label htmlFor="quantity">Quantity</label>
          <input id="quantity" name="quantity" type="number" value={this.state.quantity} onChange={this.handleInputChange} />
          <input type="button" value="Refund" onClick={this.handleSubmit} />
        </form>
      </div>
    );
  }
}

export default RefundTicket;