import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function () {
    const { web3 } = this;
    console.log("web3", web3);
    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      console.log("network", networkId);
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address
      );
      console.log("contract", this.meta);
      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.");
      // alert("Could not connect to contract or chain.");
    }
  },

  connWallet: async function () {
    if (window.ethereum) {
      // use MetaMask's provider
      App.web3 = new Web3(window.ethereum);

      // get permission to access accounts
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      var accounts = await App.web3.eth.getAccounts();

      var account = accounts[0];

      console.log("account", account);
      if (account) {
        this.walletConnected(account);
        document.getElementById("connWallet").disabled = true;
      }
    } else {
      console.warn(
        "No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live"
      );
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      App.web3 = new Web3(
        new Web3.providers.HttpProvider("http://127.0.0.1:9545")
      );
    }
  },

  walletConnected: function (account) {
    var div = document.createElement("div");
    var wallet = document.getElementById("wallet");
    wallet.appendChild(div);
    var text = "<br/><h4>Wallet " + account + " connected!</h4>";
    div.innerHTML += text;
  },

  setStatus: function (message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  createStar: async function () {
    const { createStar, checkIfStarExist } = this.meta.methods;
    const name = document.getElementById("starName").value;
    const id = document.getElementById("starId").value;
    const checkStar = await checkIfStarExist(name).call();
    console.log(checkStar);
    if (!checkStar) {
      try {
        await createStar(name, id).send({ from: this.account });
        App.setStatus(
          "New Star Owner" + " " + name + " is " + this.account + "."
        );
        document.getElementById("starName").value = "";
        document.getElementById("starId").value = "";
      } catch (error) {
        alert(error.message + "Star ID reserved");
        document.getElementById("starName").value = "";
        document.getElementById("starId").value = "";
      }
    } else {
      alert("Name reserved");
      document.getElementById("starName").value = "";
      document.getElementById("starId").value = "";
    }
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function () {
    const { lookUptokenIdToStarInfo } = this.meta.methods;
    const starId = document.getElementById("lookid").value;
    try {
      const starDetail = await lookUptokenIdToStarInfo(starId).call();
      console.log(starDetail["0"]);
      const output = document.getElementById("output");
      // output.innerHTML += starDetail[0];
      App.setStatus(
        "StarId :" +
          starId +
          "'s details:\" " +
          starDetail[0] +
          ' " is owned by ' +
          starDetail[1]
      );
      document.getElementById("lookid").value = "";
    } catch (error) {
      alert("You are enquring a non-existence token");
      document.getElementById("lookid").value = "";
    }
  },
};

window.App = App;

window.addEventListener("load", async function () {
  if (window.ethereum) {
    //   // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);

    //   // get permission to access accounts
    //   await window.ethereum.request({
    //     method: "eth_requestAccounts",
    //   });
    // } else {
    //   console.warn(
    //     "No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live"
    //   );
    //   // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    //   App.web3 = new Web3(
    //     new Web3.providers.HttpProvider("http://127.0.0.1:9545")
    //   );
  }
  App.start();
});
