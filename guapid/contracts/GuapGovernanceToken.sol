// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GuapGovernanceToken
 * @notice ERC-20 governance token (GVOTE) for the GuapDAO.
 *         No OpenZeppelin dependency — pure Solidity.
 *         evmVersion: paris compatible (no PUSH0).
 */
contract GuapGovernanceToken {
    string public constant name = "Guap Governance";
    string public constant symbol = "GVOTE";
    uint8 public constant decimals = 18;

    address public owner;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner_, address indexed spender, uint256 value);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "GVOTE: not owner");
        _;
    }

    constructor(address owner_) {
        require(owner_ != address(0), "GVOTE: zero owner");
        owner = owner_;
    }

    // ─── Ownership ───────────────────────────────────────────────────────────

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "GVOTE: zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // ─── Minting ─────────────────────────────────────────────────────────────

    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "GVOTE: mint to zero");
        _totalSupply += amount;
        _balances[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    // ─── ERC-20 view ─────────────────────────────────────────────────────────

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function allowance(address owner_, address spender) external view returns (uint256) {
        return _allowances[owner_][spender];
    }

    /// @notice Returns current balance as voting weight (no snapshots for v1).
    function getVotes(address account) external view returns (uint256) {
        return _balances[account];
    }

    // ─── ERC-20 mutators ─────────────────────────────────────────────────────

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        require(spender != address(0), "GVOTE: approve to zero");
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = _allowances[from][msg.sender];
        require(allowed >= amount, "GVOTE: allowance exceeded");
        if (allowed != type(uint256).max) {
            _allowances[from][msg.sender] = allowed - amount;
        }
        _transfer(from, to, amount);
        return true;
    }

    // ─── Internal ────────────────────────────────────────────────────────────

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "GVOTE: transfer from zero");
        require(to != address(0), "GVOTE: transfer to zero");
        require(_balances[from] >= amount, "GVOTE: insufficient balance");
        _balances[from] -= amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
    }
}
