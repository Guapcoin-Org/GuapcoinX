// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GuapDIDRegistry
 * @notice DID Document registry for did:guap identifiers.
 *         Based on the uport-project/ethr-did-registry pattern.
 *         Compiled with evmVersion = "paris" for Guapcoin EVM compatibility.
 */
contract GuapDIDRegistry {

    mapping(address => uint) public changed;
    mapping(address => address) public owners;
    mapping(address => mapping(bytes32 => mapping(address => uint))) public delegates;

    event DIDOwnerChanged(
        address indexed identity,
        address owner,
        uint previousChange
    );

    event DIDDelegateChanged(
        address indexed identity,
        bytes32 delegateType,
        address delegate,
        uint validTo,
        uint previousChange
    );

    event DIDAttributeChanged(
        address indexed identity,
        bytes32 name,
        bytes value,
        uint validTo,
        uint previousChange
    );

    modifier onlyOwner(address identity) {
        require(identityOwner(identity) == msg.sender, "GuapDIDRegistry: not owner");
        _;
    }

    function identityOwner(address identity) public view returns (address) {
        address owner = owners[identity];
        return owner == address(0) ? identity : owner;
    }

    function changeOwner(address identity, address newOwner) external onlyOwner(identity) {
        owners[identity] = newOwner;
        emit DIDOwnerChanged(identity, newOwner, changed[identity]);
        changed[identity] = block.number;
    }

    function addDelegate(
        address identity,
        bytes32 delegateType,
        address delegate,
        uint validity
    ) external onlyOwner(identity) {
        delegates[identity][delegateType][delegate] = block.timestamp + validity;
        emit DIDDelegateChanged(
            identity,
            delegateType,
            delegate,
            block.timestamp + validity,
            changed[identity]
        );
        changed[identity] = block.number;
    }

    function revokeDelegate(
        address identity,
        bytes32 delegateType,
        address delegate
    ) external onlyOwner(identity) {
        delegates[identity][delegateType][delegate] = block.timestamp;
        emit DIDDelegateChanged(
            identity,
            delegateType,
            delegate,
            block.timestamp,
            changed[identity]
        );
        changed[identity] = block.number;
    }

    function setAttribute(
        address identity,
        bytes32 name,
        bytes calldata value,
        uint validity
    ) external onlyOwner(identity) {
        emit DIDAttributeChanged(
            identity,
            name,
            value,
            validity == 0 ? type(uint).max : block.timestamp + validity,
            changed[identity]
        );
        changed[identity] = block.number;
    }

    function revokeAttribute(
        address identity,
        bytes32 name,
        bytes calldata value
    ) external onlyOwner(identity) {
        emit DIDAttributeChanged(identity, name, value, 0, changed[identity]);
        changed[identity] = block.number;
    }

    function validDelegate(
        address identity,
        bytes32 delegateType,
        address delegate
    ) public view returns (bool) {
        uint validity = delegates[identity][delegateType][delegate];
        return validity > block.timestamp;
    }
}
