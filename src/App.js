import React, { Component } from 'react'
import Ticket from '../build/contracts/Ticket.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

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
    const {maxCap, price, address} = this.state;
    const contract = await this.instantiateTicketContract(this.props.web3, address, maxCap, price, address);
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

  render () {
    return (
      <div>
        <h3>Create Event</h3>
        <form>
          <label htmlFor="maxCap">Max Cap</label>
          <input id="maxCap" name="maxCap" type="text" value={this.state.maxCap} onChange={this.handleInputChange}/>
          <label htmlFor="price">Price</label>
          <input id="price" name="price" type="number" value={this.state.price} onChange={this.handleInputChange}/>
          <label htmlFor="address">Fund wallet address</label>
          <input id="address" name="address" type="text" value={this.state.address} onChange={this.handleInputChange}/>
          <input type="button" value="Crear" onClick={this.handleSubmit} />
        </form>
      </div> 
    );
  }
  
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contractData: null,
      contract: null,
      logs: [],
      web3: null
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    const getSenderAccount = (web3) => {
      const promise = new Promise( (resolve, reject) => {
        web3.eth.getAccounts( (e, accounts) => {
          if(e) {
            console.log('Reject');
            reject(e);
          }
          else {
            resolve(accounts[0]);
          }
        });

      });
      return promise;
    }

    const initialize = async () => {
      console.log('Start initialize');

      const { web3 } = await getWeb3;
      const sender = await getSenderAccount(web3);

      console.log(sender)

      // const contract = await this.instantiateTicketContract(web3, sender, 10, 1000, sender);
      
      // console.log(`Contract address: ${contract.account}`)
      
      const self = this;
      const updateLogs = (error, logs) => {
        self.setState({
          logs: self.state.logs.concat([logs])
        })
        // self.refreshContractData();
      };

      // const filter = contract.Updated({}, {fromBlock: 0, toBlock: 'latest'});
      // filter.watch(updateLogs);
      this.setState({
        // contract,
        web3,
        sender
      });
      // this.refreshContractData();
    }
    console.log('Calling initialize');
    initialize().catch(err => {
      console.log('Error initializing: ', err)
    });
  }

  async instantiateTicketContract(web3, ownerAddress, maxCap, price, walletAddress) {
    console.log(`Creating contract with params: ${ownerAddress} ${maxCap} ${price} ${walletAddress}`);
    const contract = require('truffle-contract');
    const ticket = contract(Ticket);
    ticket.setProvider(web3.currentProvider);
    const ticketInstance = await ticket.new([maxCap, price, walletAddress], { from: ownerAddress, gas: 2000000 });
    return ticketInstance;
  }

  render() {
    const {web3} = this.state;

    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>TicketChain</h1>
              <p>Sell your event's tickets on the blockchain</p>
              <CreateEvent web3={web3}/>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
