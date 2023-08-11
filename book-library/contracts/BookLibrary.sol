// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";

contract BookLibrary is Ownable {

    uint256 bookId = 1;

    struct Book {
        string name;
        uint256 copiesAvailable;
        address[] borrowers;
    }

    mapping(uint256 => Book) books;
    mapping(address => mapping(uint256 => bool)) userBorrowedBooks;

    function addBookCopies(uint256 _bookId, uint256 _copies) external onlyOwner {
        require(_bookId <= bookId, "Book with this ID does not exist");
        require(_copies != 0, "Copies need to be more than 0");

        books[_bookId].copiesAvailable += _copies;
    }

    function addNewBook(string calldata _name, uint256 _copies) external onlyOwner {
        bookId++;
        books[bookId] = Book(_name, _copies, new address[](0));
    }

    function listAvailableBooks() external view returns(Book[] memory) {
        Book[] memory availableBooks = new Book[](bookId);
        uint256 counter = 0;

        for (uint i = 1; i <= bookId; i++) {
            if (books[i].copiesAvailable != 0) {
                availableBooks[counter] = books[i];
                counter++;
            }
        }

        return availableBooks;
    }

    function listBookBorrowers(uint256 _bookId) external view returns (address[] memory) {
        require(_bookId <= bookId, "Book with this ID does not exist");

        return books[_bookId].borrowers;
    }

    function borrowBook(uint256 _bookId) external {
        require(books[_bookId].copiesAvailable != 0, "No copies available");
        require(!userBorrowedBooks[msg.sender][_bookId], "You have already borrowed this book");

        userBorrowedBooks[msg.sender][_bookId] = true;
        books[_bookId].copiesAvailable--;
        books[_bookId].borrowers.push(msg.sender);
    }

    function returnBook(uint256 _bookId) external {
        require(userBorrowedBooks[msg.sender][_bookId], "You have not borrowed this book");

        userBorrowedBooks[msg.sender][_bookId] = false;
        books[_bookId].copiesAvailable++;
    }
}
