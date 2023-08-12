// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;
import "@openzeppelin/contracts/access/Ownable.sol";

contract BookLibrary is Ownable {
    struct Book {
        string title;
        uint8 copiesAvailable;
        address[] borrowers;
        bool exists;
    }

    bytes32[] public bookKeys;
    mapping(bytes32 => Book) public books;
    mapping(address => mapping(bytes32 => bool)) public userBorrowedBooks;

    event BookAdded(string title, uint8 copies);
    event BookUpdated(string title, uint8 copies);
    event BookBorrowed(string title, address user);
    event BookReturned(string title, address user);

    modifier validBookData(string memory _title, uint8 _copies) {
        bytes memory title = bytes(_title);
        require(title.length > 0 && _copies > 0, "Book data is not valid");
        _;
    }

    function addBook(string memory _title, uint8 _copies)
        public
        onlyOwner
        validBookData(_title, _copies)
    {
        bytes32 bookKey = keccak256(abi.encodePacked(_title));

        Book storage book = books[bookKey];

        if (book.exists) {
            book.copiesAvailable += _copies;
            emit BookUpdated(_title, _copies);
        } else {
            address[] memory borrowers;

            Book memory newBook = Book({
                title: _title,
                copiesAvailable: _copies,
                borrowers: borrowers,
                exists: true
            });

            books[bookKey] = newBook;
            bookKeys.push(bookKey);
            emit BookAdded(_title, _copies);
        }
    }

    function listAvailableBooks() external view returns (Book[] memory) {
        uint256 availableCount = 0;

        for (uint256 i = 0; i < bookKeys.length; i++) {
            if (books[bookKeys[i]].copiesAvailable != 0) {
                availableCount++;
            }
        }

        Book[] memory availableBooks = new Book[](availableCount);
        uint256 counter = 0;
        for (uint256 i = 0; i < availableCount; i++) {
            bytes32 bookKey = bookKeys[i];
            availableBooks[counter] = books[bookKey];
            counter++;
        }

        return availableBooks;
    }

    function listBookBorrowers(bytes32 _bookId)
        external
        view
        returns (address[] memory)
    {
        require(books[_bookId].exists, "Book with this ID does not exist");

        return books[_bookId].borrowers;
    }

    function borrowBook(bytes32 _bookId) external {
        Book storage book = books[_bookId];

        require(book.copiesAvailable != 0, "No copies available");
        require(
            !userBorrowedBooks[msg.sender][_bookId],
            "You have already borrowed this book"
        );

        userBorrowedBooks[msg.sender][_bookId] = true;
        book.copiesAvailable--;
        book.borrowers.push(msg.sender);

        emit BookBorrowed(book.title, msg.sender);
    }

    function returnBook(bytes32 _bookId) external {
        Book storage book = books[_bookId];

        require(
            userBorrowedBooks[msg.sender][_bookId],
            "You have not borrowed this book"
        );

        userBorrowedBooks[msg.sender][_bookId] = false;
        book.copiesAvailable++;

        emit BookReturned(book.title, msg.sender);
    }
}
