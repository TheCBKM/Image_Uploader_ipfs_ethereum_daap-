import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";

import ipfs from './ipfs';

import "./App.css";

class App extends Component {
  state = { web3: null, accounts: null, contract: null, buffer: null, ipfsHash: "" };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();
    console.log(response)
    this.setState({ ipfsHash: response })
    // Update state with the result.
  };
  caputreFile = (event) => {
    console.log("caputreFile")
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }

  }
  onSubmit = async(event) => {
    event.preventDefault()
    console.log("onSubmit")
    ipfs.files.add(this.state.buffer, async(err, res) => {
      if (err) {
        console.error(err)
        return
      }
      this.setState({ ipfsHash: res[0].hash })
      console.log('ipfsHash', this.state.ipfsHash)
      await this.state.contract.methods.set(this.state.ipfsHash).send({ from:this.state.accounts[0] });
  

    })


  }
  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#" className="pure-menu pure-menu-linl">IPFS File Upload dapp</a>
        </nav>
        <h1>Your Images</h1>
        <p>YThis Image is stored on IPFS & Ethereum Blockchain</p>
        <img src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`} alt=""></img>
        <h2>Upload Image</h2>
        <form onSubmit={this.onSubmit}>
          <input type="file" onChange={this.caputreFile} />
          <button type="submit">Submit</button>

        </form>
      </div>
    );
  }
}

export default App;
