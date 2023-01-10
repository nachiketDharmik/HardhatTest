const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect , assert } = require("chai");
//const { ethers } = require("ethers");
//const { ethers } = require("ethers");
//const { ethers } = require("ethers");
//const { ethers } = require("ethers");


describe("This is the main testing scope" , function () {
let Contract ;
let contractInstance ;
let owner ;
let account1 ;


beforeEach( async function(){
  Contract = await ethers.getContractFactory("Faucet");
  [owner , account1] = await ethers.getSigners();
  contractInstance = await Contract.deploy({value: ethers.utils.parseUnits("10","ether"),});
});

describe("Deployment" , function(){

  it("Should set the right owner" , async function(){
     expect(await contractInstance.owner()).to.equal(owner.address);
  });
   
  it("To get contract balance" , async function(){
    let balance = parseInt( await ethers.provider.getBalance(contractInstance.address));
    console.log("Balance ",balance);
    expect( balance).to.equal(10000000000000000000);
  });

  it("To check withdraw function with owner calling " , async function(){
    await contractInstance.withdraw(100000000);
    let balance = parseInt( await ethers.provider.getBalance(contractInstance.address));
    expect( balance).to.not.equal(10000000000000000000);
  });

  it("To check withdraw function with account1 calling " , async function(){
    
    let balanceBefore = await ethers.provider.getBalance(account1.address);
    console.log("BalanceBefore ",balanceBefore);
    
    //change to account1 and then call withdraw function
    await contractInstance.connect(account1).withdraw(999999900000000);
  
    let balanceAfter = await ethers.provider.getBalance(account1.address);
    console.log("BalanceAfter ",balanceAfter);

    expect( parseInt(balanceAfter)).to.be.greaterThan(10000000000000000000);
  });

it("Withdraw should revert if amount is grater than 0.1 ETH" ,async function(){
  let withdrawAmount = ethers.utils.parseUnits("1", "ether");
  await expect( contractInstance.withdraw(withdrawAmount)).to.be.reverted;
 
});

it("Only owner can call WithdrawAll function" , async function(){

  await expect(contractInstance.withdrawAll()).not.to.be.reverted ;
});

it("Only owner can call WithdrawAll function calling fron account1" , async function(){
    
  await expect(contractInstance.connect(account1).withdrawAll()).to.be.reverted ;
});

it("Contract balance should be zero after WithdrawAll" , async function(){

  await contractInstance.withdrawAll() ;
  let balance = parseInt( await ethers.provider.getBalance(contractInstance.address))
  expect(balance).to.equal(0);
});

it("To test event FallbackCalled when calling fallback function" , async function(){
    
     // send an empty transaction to the faucet
     let response = await owner.sendTransaction({
      to: contractInstance.address,
    });
    let receipt = await response.wait();
    
    // query the logs for the FallbackCalled event
    const topic = contractInstance.interface.getEventTopic('FallbackCalled');
    const log = receipt.logs.find(x => x.topics.indexOf(topic) >= 0);
    const deployedEvent = contractInstance.interface.parseLog(log);
   //console.log(deployedEvent);
    assert(deployedEvent, "Expected the Fallback Called event to be emitted!");
});

});


});