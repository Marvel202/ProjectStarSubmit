// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.0 (token/ERC721/IERC721.sol)

pragma solidity ^0.8.0;

//Importing openzeppelin-solidity ERC-721 implemented Standard
// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract StarNotary is ERC721, Ownable {
    // Star data
    struct Star {
        string name;
    }

    // Implement Task 1 Add a name and symbol properties
    // name: Is a short name to your token
    // symbol: Is a short string like 'USD' -> 'American Dollar'
    constructor() ERC721("Star Collection", "STK") {}

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;
    mapping(uint256 => bool) public starsForExchange;
    // mapping unique name
    mapping(string => bool) public uniqueName;

    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public {
        // Passing the name and tokenId as a parameters
        string memory tempName = _name;
        require(!checkIfStarExist(tempName), "Star already exist!");
        Star memory newStar = Star(_name); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        uniqueName[_name] = true;
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    function checkIfStarExist(string memory name) public view returns (bool) {
        return uniqueName[name];
    }

    // function nameToHash(string memory _name) public pure returns(bytes32) {
    // 		return keccak256(abi.encodePacked(_name));
    // 	}
    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(
            ownerOf(_tokenId) == msg.sender,
            "You can't sale the Star you don't own"
        );
        starsForSale[_tokenId] = _price;
        _approve(msg.sender, _tokenId);
    }

    //user enlist the star for exchange && pre-approve Owner of Contract to transfer on their behalf
    function listForExchange(uint256 _tokenId) public {
        require(
            ownerOf(_tokenId) == msg.sender,
            "You can't list the Star you don't own"
        );
        starsForExchange[_tokenId] = true;
        _approve(address(this), _tokenId);
    }

    function checkIsListForExchange(uint256 _tokenId)
        public
        view
        returns (bool)
    {
        return starsForExchange[_tokenId];
    }

    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return payable(address(uint160(x)));
    }

    function buyStar(uint256 _tokenId) public payable {
        require(ownerOf(_tokenId) != address(0), "tokenId not valid!");
        require(
            starsForSale[_tokenId] > 0,
            "The Star has not been up for sale"
        );
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough Ether");
        _approve(msg.sender, _tokenId);
        transferFrom(ownerAddress, msg.sender, _tokenId); // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom
        address payable ownerAddressPayable = _make_payable(ownerAddress); // We need to make this conversion to be able to use transfer() function to transfer ethers
        ownerAddressPayable.transfer(starCost);
        if (msg.value > starCost) {
            payable(msg.sender).transfer(msg.value - starCost);
        }
    }

    // Implement Task 1 lookUptokenIdToStarInfo
    function lookUptokenIdToStarInfo(uint256 _tokenId)
        public
        view
        returns (string memory, address)
    {
        //1. You should return the Star saved in tokenIdToStarInfo mapping
        require(
            ownerOf(_tokenId) != address(0),
            "This is not a valid tokenId."
        );
        return (tokenIdToStarInfo[_tokenId].name, ownerOf(_tokenId));
    }

    // Implement Task 1 Exchange Stars function
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        //1. Passing to star tokenId you will need to check if the owner of _tokenId1 or _tokenId2 is the sender
        (, address user1) = lookUptokenIdToStarInfo(_tokenId1);
        (, address user2) = lookUptokenIdToStarInfo(_tokenId2);
        // address Star1 = ownerOf(_tokenId1);
        // address Star2 = ownerOf(_tokenId2);
        require(
            user1 == msg.sender || user2 == msg.sender,
            "From exchangeStars func:sender is not owner"
        );

        checkIsListForExchange(_tokenId1);
        checkIsListForExchange(_tokenId2);
        // _approve(user1, _tokenId2);
        // _approve(user2, _tokenId1);

        //2. You don't have to check for the price of the token (star)
        //3. Get the owner of the two tokens (ownerOf(_tokenId1), ownerOf(_tokenId2)
        //4. Use _transferFrom function to exchange the tokens.
        this.transferFrom(user1, user2, _tokenId1);
        this.transferFrom(user2, user1, _tokenId2);
    }

    // Implement Task 1 Transfer Stars
    function transferStar(address _to1, uint256 _tokenId) public {
        //1. Check if the sender is the ownerOf(_tokenId)
        require(ownerOf(_tokenId) == msg.sender, "not owner of the star!");
        //2. Use the transferFrom(from, to, tokenId); function to transfer the Star
        // _approve(msg.sender, _tokenId);
        transferFrom(msg.sender, _to1, _tokenId);
    }
}
