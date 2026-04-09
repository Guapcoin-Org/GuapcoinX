// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GuapValidatorRegistry
 * @notice Manages Human Validator applications and approvals for GuapID.
 *         Only the DAO (owner) can approve or remove validators.
 *         evmVersion: paris compatible (no PUSH0).
 */
contract GuapValidatorRegistry {
    // ─── Types ───────────────────────────────────────────────────────────────

    struct Application {
        string ipfsCID;
        uint256 submittedAt;
        bool approved;
        bool rejected;
    }

    // ─── State ───────────────────────────────────────────────────────────────

    address public owner; // DAO contract address

    mapping(address => Application) private _applications;
    address[] private _applicants;
    address[] private _approvedValidators;
    mapping(address => bool) private _isValidator;
    // track index in _approvedValidators for efficient removal
    mapping(address => uint256) private _validatorIndex;

    // ─── Events ──────────────────────────────────────────────────────────────

    event ApplicationSubmitted(address indexed applicant, string ipfsCID);
    event ValidatorApproved(address indexed validator);
    event ValidatorRemoved(address indexed validator);

    // ─── Modifiers ───────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Registry: not owner");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor(address daoAddress) {
        require(daoAddress != address(0), "Registry: zero dao address");
        owner = daoAddress;
    }

    // ─── Public functions ────────────────────────────────────────────────────

    /// @notice Submit an application to become a Human Validator.
    /// @param ipfsCID IPFS CID of the validator profile document.
    function submitApplication(string calldata ipfsCID) external {
        require(bytes(ipfsCID).length > 0, "Registry: empty CID");
        require(!_isValidator[msg.sender], "Registry: already a validator");
        require(_applications[msg.sender].submittedAt == 0, "Registry: application exists");

        _applications[msg.sender] = Application({
            ipfsCID: ipfsCID,
            submittedAt: block.timestamp,
            approved: false,
            rejected: false
        });
        _applicants.push(msg.sender);

        emit ApplicationSubmitted(msg.sender, ipfsCID);
    }

    // ─── DAO-only functions ──────────────────────────────────────────────────

    /// @notice Approve a validator application.
    function approveValidator(address validator) external onlyOwner {
        require(validator != address(0), "Registry: zero address");
        require(_applications[validator].submittedAt != 0, "Registry: no application");
        require(!_isValidator[validator], "Registry: already approved");
        require(!_applications[validator].rejected, "Registry: application rejected");

        _applications[validator].approved = true;
        _isValidator[validator] = true;
        _validatorIndex[validator] = _approvedValidators.length;
        _approvedValidators.push(validator);

        emit ValidatorApproved(validator);
    }

    /// @notice Remove an approved validator.
    function removeValidator(address validator) external onlyOwner {
        require(_isValidator[validator], "Registry: not a validator");

        _isValidator[validator] = false;
        _applications[validator].approved = false;
        _applications[validator].rejected = true;

        // Swap-and-pop from approvedValidators array
        uint256 idx = _validatorIndex[validator];
        uint256 last = _approvedValidators.length - 1;
        if (idx != last) {
            address lastAddr = _approvedValidators[last];
            _approvedValidators[idx] = lastAddr;
            _validatorIndex[lastAddr] = idx;
        }
        _approvedValidators.pop();
        delete _validatorIndex[validator];

        emit ValidatorRemoved(validator);
    }

    // ─── Views ───────────────────────────────────────────────────────────────

    function isValidator(address account) external view returns (bool) {
        return _isValidator[account];
    }

    function getApplication(address applicant)
        external
        view
        returns (
            string memory ipfsCID,
            uint256 submittedAt,
            bool approved,
            bool rejected
        )
    {
        Application storage app = _applications[applicant];
        return (app.ipfsCID, app.submittedAt, app.approved, app.rejected);
    }

    function getApprovedValidators() external view returns (address[] memory) {
        return _approvedValidators;
    }

    function getApplicants() external view returns (address[] memory) {
        return _applicants;
    }
}
