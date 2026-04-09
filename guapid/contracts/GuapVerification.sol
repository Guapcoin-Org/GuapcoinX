// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GuapVerification
 * @notice On-chain attestation registry for GuapID Human Validator verifications.
 *         No personal ID data is stored — only a hash and category type.
 *         evmVersion: paris compatible (no PUSH0).
 */
interface IValidatorRegistry {
    function isValidator(address account) external view returns (bool);
}

contract GuapVerification {
    // ─── Types ───────────────────────────────────────────────────────────────

    // ID type categories
    uint8 public constant GOVERNMENT_ID    = 0;
    uint8 public constant TRIBAL_ID        = 1;
    uint8 public constant ORGANIZATIONAL_ID = 2;
    uint8 public constant PASSPORT         = 3;
    uint8 public constant OTHER            = 4;

    struct Attestation {
        address validator;
        uint8 idType;
        uint256 timestamp;
        bool valid;
        bytes32 attestationHash;
    }

    // ─── State ───────────────────────────────────────────────────────────────

    address public validatorRegistry;
    address public daoOwner;

    mapping(address => Attestation) private _attestations;

    // ─── Events ──────────────────────────────────────────────────────────────

    event AttestationIssued(
        address indexed identity,
        address indexed validator,
        uint8 idType
    );
    event AttestationRevoked(address indexed identity);

    // ─── Modifiers ───────────────────────────────────────────────────────────

    modifier onlyValidator() {
        require(
            IValidatorRegistry(validatorRegistry).isValidator(msg.sender),
            "Verification: not a validator"
        );
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor(address validatorRegistry_, address daoOwner_) {
        require(validatorRegistry_ != address(0), "Verification: zero registry");
        require(daoOwner_ != address(0), "Verification: zero dao owner");
        validatorRegistry = validatorRegistry_;
        daoOwner = daoOwner_;
    }

    // ─── Attestation functions ───────────────────────────────────────────────

    /**
     * @notice Issue an attestation for an identity.
     * @param identity        The wallet address being verified.
     * @param idType          Category of ID used (0–4).
     * @param attestationHash Privacy-preserving hash of verification data.
     */
    function attest(
        address identity,
        uint8 idType,
        bytes32 attestationHash
    ) external onlyValidator {
        require(identity != address(0), "Verification: zero identity");
        require(idType <= OTHER, "Verification: invalid id type");
        require(attestationHash != bytes32(0), "Verification: empty hash");

        _attestations[identity] = Attestation({
            validator: msg.sender,
            idType: idType,
            timestamp: block.timestamp,
            valid: true,
            attestationHash: attestationHash
        });

        emit AttestationIssued(identity, msg.sender, idType);
    }

    /**
     * @notice Revoke an attestation.
     *         Can be called by the attesting validator or the DAO owner.
     */
    function revokeAttestation(address identity) external {
        Attestation storage att = _attestations[identity];
        require(att.valid, "Verification: no valid attestation");
        require(
            msg.sender == att.validator || msg.sender == daoOwner,
            "Verification: not authorized"
        );

        att.valid = false;
        emit AttestationRevoked(identity);
    }

    // ─── Views ───────────────────────────────────────────────────────────────

    function getAttestation(address identity)
        external
        view
        returns (
            address validator,
            uint8 idType,
            uint256 timestamp,
            bool valid
        )
    {
        Attestation storage att = _attestations[identity];
        return (att.validator, att.idType, att.timestamp, att.valid);
    }

    function isVerified(address identity) external view returns (bool) {
        return _attestations[identity].valid;
    }
}
