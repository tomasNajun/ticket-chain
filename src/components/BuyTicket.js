import React, { Component } from 'react'

class BuyTicket extends Component {
  constructor(props) {
    super(props);

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

  async getContractData(ticketInstance) {
    const ticketPrice = await ticketInstance.price.call();
    const ticketAvailable = await ticketInstance.ticketAvailable.call();
    return {
      unitPrice: ticketPrice.toNumber(),
      ticketAvailable: ticketAvailable.toNumber()
    };
  }
  componentWillReceiveProps() {

    const contractData = this.props.contractData;
    if (this.props.contractData) {
      this.setState({
        unitPrice: contractData.ticketPrice,
        ticketAvailable: contractData.ticketAvailable
      });
    }
    if (this.props.sender) {
      this.setState({
        beneficiary: this.props.sender,
      });
    }

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
    const ticketPrice = await ticketInstance.price();
    const value = ticketPrice.toNumber() * quantity;
    console.log(`Value to pay: ${value}`);
    console.log(`Sender: ${this.props.sender}`);
    return ticketInstance.buyTickets(beneficiary, quantity, { from: this.props.sender, value: value });
  }

  render() {
    return (
      <div>
        <h3>Ticket Box</h3>
        <h4>Ticket Info</h4>
        <div className="pure-g">
          <ul>
            <li>
              <div className="pure-u-1-1"><b>Price:</b> {this.state.unitPrice} </div>
            </li>
            <li>
              <div className="pure-u-1-1"><b>Tickets available:</b> {this.state.ticketAvailable}</div>
            </li>
          </ul>
        </div>
        <h4>Buy tickets</h4>
        <form className="pure-form pure-form-stacked">
          <label htmlFor="beneficiary">Beneficiary</label>
          <input id="beneficiary" name="beneficiary" type="text" value={this.state.beneficiary} onChange={this.handleInputChange} className="pure-input-1-3"/>
          <label htmlFor="quantity">Quantity</label>
          <input id="quantity" name="quantity" type="number" value={this.state.quantity} onChange={this.handleInputChange} />
          <input type="button" value="Buy" onClick={this.handleSubmit} className="pure-button pure-button-primary"/>
        </form>
      </div>
    );
  }
}

export default BuyTicket;