// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GuapDAO
 * @notice Simple governance contract for the GuapID ecosystem.
 *         GVOTE holders propose and vote on protocol actions.
 *         evmVersion: paris compatible (no PUSH0).
 */
interface IGVOTE {
    function getVotes(address account) external view returns (uint256);
}

contract GuapDAO {
    // ─── Constants ───────────────────────────────────────────────────────────

    uint256 public constant VOTING_PERIOD = 40320;          // ~7 days at 15 s/block
    uint256 public constant PROPOSAL_THRESHOLD = 100 * 1e18; // 100 GVOTE to propose
    uint256 public constant QUORUM = 1000 * 1e18;            // 1 000 GVOTE quorum

    // ─── Types ───────────────────────────────────────────────────────────────

    enum ProposalState {
        Pending,
        Active,
        Defeated,
        Succeeded,
        Executed,
        Cancelled
    }

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        address target;
        bytes callData;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startBlock;
        uint256 endBlock;
        bool executed;
        bool cancelled;
    }

    // ─── State ───────────────────────────────────────────────────────────────

    address public governanceToken;
    address public owner;

    uint256 private _proposalCount;
    mapping(uint256 => Proposal) private _proposals;
    // proposalId => voter => hasVoted
    mapping(uint256 => mapping(address => bool)) private _hasVoted;

    // ─── Events ──────────────────────────────────────────────────────────────

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        address target,
        string description,
        uint256 startBlock,
        uint256 endBlock
    );
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);

    // ─── Modifiers ───────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "DAO: not owner");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor(address governanceToken_, address owner_) {
        require(governanceToken_ != address(0), "DAO: zero token");
        require(owner_ != address(0), "DAO: zero owner");
        governanceToken = governanceToken_;
        owner = owner_;
    }

    // ─── Governance ──────────────────────────────────────────────────────────

    function propose(
        address target,
        bytes calldata callData,
        string calldata description
    ) external returns (uint256) {
        uint256 votes = IGVOTE(governanceToken).getVotes(msg.sender);
        require(votes >= PROPOSAL_THRESHOLD, "DAO: insufficient voting power");
        require(target != address(0), "DAO: zero target");
        require(bytes(description).length > 0, "DAO: empty description");

        _proposalCount += 1;
        uint256 id = _proposalCount;

        uint256 start = block.number;
        uint256 end = start + VOTING_PERIOD;

        _proposals[id] = Proposal({
            id: id,
            proposer: msg.sender,
            description: description,
            target: target,
            callData: callData,
            forVotes: 0,
            againstVotes: 0,
            startBlock: start,
            endBlock: end,
            executed: false,
            cancelled: false
        });

        emit ProposalCreated(id, msg.sender, target, description, start, end);
        return id;
    }

    function vote(uint256 proposalId, bool support) external {
        Proposal storage p = _proposals[proposalId];
        require(p.id != 0, "DAO: proposal not found");
        require(!_hasVoted[proposalId][msg.sender], "DAO: already voted");
        require(block.number >= p.startBlock, "DAO: not started");
        require(block.number <= p.endBlock, "DAO: voting ended");
        require(!p.cancelled, "DAO: cancelled");

        uint256 weight = IGVOTE(governanceToken).getVotes(msg.sender);
        require(weight > 0, "DAO: no voting power");

        _hasVoted[proposalId][msg.sender] = true;

        if (support) {
            p.forVotes += weight;
        } else {
            p.againstVotes += weight;
        }

        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    function execute(uint256 proposalId) external {
        Proposal storage p = _proposals[proposalId];
        require(p.id != 0, "DAO: proposal not found");
        ProposalState s = state(proposalId);
        require(s == ProposalState.Succeeded, "DAO: not succeeded");

        p.executed = true;
        emit ProposalExecuted(proposalId);

        (bool success, bytes memory returnData) = p.target.call(p.callData);
        if (!success) {
            if (returnData.length > 0) {
                // bubble up revert reason
                assembly {
                    revert(add(returnData, 32), mload(returnData))
                }
            }
            revert("DAO: execution failed");
        }
    }

    function cancel(uint256 proposalId) external {
        Proposal storage p = _proposals[proposalId];
        require(p.id != 0, "DAO: proposal not found");
        require(!p.executed, "DAO: already executed");
        require(!p.cancelled, "DAO: already cancelled");
        require(msg.sender == p.proposer || msg.sender == owner, "DAO: not authorized");

        p.cancelled = true;
        emit ProposalCancelled(proposalId);
    }

    // ─── Views ───────────────────────────────────────────────────────────────

    function state(uint256 proposalId) public view returns (ProposalState) {
        Proposal storage p = _proposals[proposalId];
        require(p.id != 0, "DAO: proposal not found");

        if (p.cancelled) return ProposalState.Cancelled;
        if (p.executed) return ProposalState.Executed;
        if (block.number < p.startBlock) return ProposalState.Pending;
        if (block.number <= p.endBlock) return ProposalState.Active;

        // Voting ended — check result
        uint256 totalVotes = p.forVotes + p.againstVotes;
        if (totalVotes < QUORUM) return ProposalState.Defeated;
        if (p.forVotes > p.againstVotes) return ProposalState.Succeeded;
        return ProposalState.Defeated;
    }

    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        require(_proposals[proposalId].id != 0, "DAO: proposal not found");
        return _proposals[proposalId];
    }

    function proposalCount() external view returns (uint256) {
        return _proposalCount;
    }

    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return _hasVoted[proposalId][voter];
    }
}
