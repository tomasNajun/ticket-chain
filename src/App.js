import React, { Component } from 'react';
import Ticket from '../build/contracts/Ticket.json';
import getWeb3 from './utils/getWeb3';
import BuyTicket from './components/BuyTicket';
import CreateEvent from './components/CreateEvent';
import BurnTicket from './components/BurnTicket';
import TransferTicket from './components/TransferTicket';

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contractData: null,
      contract: null,
      logs: [],
      web3: null
    }

    this.handleNewEventCreated = this.handleNewEventCreated.bind(this);
  }

  handleNewEventCreated (ticketInstance) {
    console.log('Ticket instance in App: ', ticketInstance);
    this.setState({
      contract: ticketInstance
    });
  }

  async getContractData(ticketInstance) {
    const totalSupply = await ticketInstance.totalSupply();
    const eventMaxCap = await ticketInstance.EVENT_MAX_CAP();
    const ticketPrice = await ticketInstance.price();
    console.log(`totalSupply: ${totalSupply}, eventMaxCap: ${eventMaxCap}, ticketPrice: ${ticketPrice}`);
    return {
      totalSupply,
      eventMaxCap,
      ticketPrice
    }
  }

  async refreshContractData() {
    const contractData = await this.getContractData(this.state.contract);
    this.setState({
      contractData
    })
  }



  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    const getSenderAccount = (web3) => {
      const promise = new Promise((resolve, reject) => {
        web3.eth.getAccounts((e, accounts) => {
          if (e) {
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
      const contract = await this.instantiateTicketContract(web3);
      const sender = await getSenderAccount(web3);

      console.log(sender);


      const self = this;
      const updateLogs = (error, logs) => {
        self.setState({
          logs: self.state.logs.concat([logs])
        })
        self.refreshContractData();
      };

      const filter = contract.LogPurchase({}, {fromBlock: 0, toBlock: 'latest'});
      filter.watch(updateLogs);
      this.setState({
        contract,
        web3,
        sender
      });
      this.refreshContractData();
    }
    console.log('Calling initialize');
    initialize().catch(err => {
      console.log('Error initializing: ', err)
    });
  }

  async instantiateTicketContract(web3) {
    console.log('Initializing contract');
    const contract = require('truffle-contract');
    const ticket = contract(Ticket);
    ticket.setProvider(web3.currentProvider);
    const ticketInstance = await ticket.deployed();
    console.log(`Contract at: ${ticketInstance.address}`);
    return ticketInstance;
  }

  render() {
    const { contract, web3, sender } = this.state;

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
              <CreateEvent web3={web3} sender={sender} onEventCreated={this.handleNewEventCreated}/>
              <BuyTicket web3={web3} sender={sender} contract={contract}/>
              <BurnTicket web3={web3} sender={sender} contract={contract}/>
              <TransferTicket web3={web3} sender={sender} contract={contract}/>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
