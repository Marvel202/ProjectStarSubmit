const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract("StarNotary", (accs) => {
  accounts = accs;
  owner = accounts[0];
});

it("can Create a Star", async () => {
  let tokenId = 1;
  let instance = await StarNotary.deployed();

  await instance.createStar("Awesome Star!", tokenId, { from: accounts[0] });
  assert.equal(await instance.tokenIdToStarInfo.call(tokenId), "Awesome Star!");
});

it("lets user1 put up their star for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let starId = 2;
  let starPrice = web3.utils.toWei(".01", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it("lets user1 get the funds after the sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 3;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("terriblesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  await instance.buyStar(starId, { from: user2, value: balance });
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
  let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  let value2 = Number(balanceOfUser1AfterTransaction);
  assert.equal(value1, value2);
});

it("lets user2 buy a star, if it is put up for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 4;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("terrific star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance });
  assert.equal(await instance.ownerOf.call(starId), user2);
});

it("lets user2 buy a star and decreases its balance in ether", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 5;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("Silly star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, {
    from: user2,
    value: balance,
    gasPrice: 300000000,
  });
  const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
  let value =
    Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
  assert.equal(value > starPrice, true);
});

// Implement Task 2 Add supporting unit tests

it("can add the star name and star symbol properly", async () => {
  // 1. create a Star with different tokenId
  //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let starId = 6;

  let newStar = await instance.createStar("Sixth star", starId, {
    from: user1,
  });
  let name = await instance.tokenIdToStarInfo(starId);

  assert.equal(name, "Sixth star");
  let collectionName = await instance.name.call();
  assert.equal(collectionName, "Star Collection");
  let symbol = await instance.symbol.call();
  assert.equal(symbol, "STK");

  // 1. create a Star with different tokenId
  //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
});

it("lets 2 users exchange stars", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user3 = accounts[3];
  let user2 = accounts[2];
  let starId7 = 7;
  let starId8 = 8;

  // 1. create 2 Stars with different tokenId

  let newStar7 = await instance.createStar("Seventh star", starId7, {
    from: user1,
  });
  let newStar8 = await instance.createStar("Eighth star", starId8, {
    from: user3,
  });

  // 2. Call the exchangeStars functions implemented in the Smart Contract
  await instance.listForExchange(starId7, { from: user1 });
  await instance.listForExchange(starId8, { from: user3 });
  // await instance.exchangeStars(starId7, starId8);
  console.log("star7 before", await instance.ownerOf(starId7));
  console.log("star8 before", await instance.ownerOf(starId8));

  await instance.exchangeStars(starId7, starId8, { from: user3 });

  // 3. Verify that the owners changed
  console.log("star7 after", await instance.ownerOf(starId7));
  console.log("star8 after", await instance.ownerOf(starId8));
  assert.equal(await instance.ownerOf(starId7), user3);
  assert.equal(await instance.ownerOf(starId8), user1);
});

it("lets a user transfer a star", async () => {
  // 1. create a Star with different tokenId
  let instance = await StarNotary.deployed();

  let user4 = accounts[4];
  let user5 = accounts[5];
  let starId = 9;

  await instance.createStar("Nineth star", starId, { from: user4 });
  // 2. use the transferStar function implemented in the Smart Contract
  await instance.transferStar(user5, starId, { from: user4 });
  // 3. Verify the star owner changed.
  assert.equal(await instance.ownerOf(starId), user5);
});

it("lookUptokenIdToStarInfo test", async () => {
  // 1. create a Star with different tokenId
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let starId = 10;
  await instance.createStar("Tenth star", starId, { from: user1 });
  // 2. Call your method lookUptokenIdToStarInfo
  // let starName,
  //   _ = await instance.lookUptokenIdToStarInfo(starId);
  // console.log("starName", starName);
  let starName;
  starName = await instance
    .lookUptokenIdToStarInfo(starId)
    .then((data) => (starName = data["0"]));
  // 3. Verify if you Star name is the same
  assert.equal(starName, "Tenth star");
});
