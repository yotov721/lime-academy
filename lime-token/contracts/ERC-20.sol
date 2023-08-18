// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ERC20 is IERC20 {
    uint256 private _totalSupply;

    string private name;
    string private symbol;

    mapping(address account => uint256) private _balances;

    mapping(address account => mapping(address spender => uint256)) private _allowances;

    error InsufficientFunds(address sender, uint256 balance, uint256 value);
    error InsufficientAllowance(address spender, uint256 allowance, uint256 value);
    error InsufficientBalance(address spender, uint256 burnValue, uint256 value);

    event Approve(address indexed owner, address indexed spender, uint256 value);
    event Burn(address indexed owner, uint256 value);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 totalSupply_
    ) {
        require(_totalSupply != 0, "Supply must be greater than zero");
        name = _name;
        symbol = _symbol;
        _totalSupply = totalSupply_;
    }

    function totalSupply() external view returns (uint256){
        return _totalSupply;
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        return _allowances[owner][spender];
    }

    function balanceOf(address _address) public view returns (uint256) {
        return _balances[_address];
    }

    function transfer(address _to, uint256 value) public returns (bool) {
        _transfer(msg.sender, _to, value);
        return true;
    }

    function _transfer(address _from, address _to, uint256 value) internal {
        require(_from != address(0), "Invalid Address");
        require(_to != address(0), "Invalid Address");

        uint256 senderBalance = _balances[_from];
        if (senderBalance < value) {
            revert InsufficientFunds(_from, senderBalance, value);
        }

        _balances[_from] = senderBalance - value;

        _balances[_to] += value;

        emit Transfer(_from, _to, value);
    }

    function approve(address _spender, uint256 value) public returns (bool) {
        _allowances[msg.sender][_spender] = value;
        emit Approve(msg.sender, _spender, value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 value) public virtual returns (bool) {
        _spendAllowance(_from, msg.sender, value);
        _transfer(_from, _to, value);
        return true;
    }

    function _spendAllowance(address _owner, address _spender, uint256 _value) internal {
        uint256 currAllowance = _allowances[_owner][_spender];
        if (currAllowance < _value) {
            revert InsufficientAllowance(_spender, currAllowance, _value);
        }

        _allowances[msg.sender][_spender] = currAllowance - _value;
    }

    function setAllowance(address _spender, uint256 _value) external returns (bool){
        _allowances[msg.sender][_spender] = _value;
        return true;
    }

    function burn(uint256 _value) public {
        uint256 balance = _balances[msg.sender];
        if (balance < _value) {
            revert InsufficientBalance(msg.sender, _value, balance);
        }
        _totalSupply -= _value;

        _balances[msg.sender] = balance - _value;
        emit Burn(msg.sender, _value);
    }
}
