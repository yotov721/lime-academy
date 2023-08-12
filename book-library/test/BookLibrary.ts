import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("BookLibrary", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployBookLibrary() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const BookLibrary = await ethers.getContractFactory("BookLibrary");
    const bookLibrary = await BookLibrary.deploy();

    const title = "Book1"
    const copies = 1
    const bookId = ethers.solidityPackedKeccak256(["string"], [title])

    await bookLibrary.addBook(title, copies)

    return { bookLibrary, owner, otherAccount, title, bookId, copies };
  }

  describe("AddBook", function () {
    it("Should add book which does not exist", async function () {
      const { bookLibrary, } = await loadFixture(deployBookLibrary);

      const title = "Book2"
      const copies = 3;

      await bookLibrary.addBook(title, copies);
      const bookKey = ethers.solidityPackedKeccak256(["string"], [title]);

      const book = await bookLibrary.books(bookKey);
      const bookBorrowers = await bookLibrary.listBookBorrowers(bookKey);

      expect(book.title).to.equal(title);
      expect(book.copiesAvailable).to.equal(copies);
      expect(bookBorrowers.length).to.equal(0);
      expect(book.exists).to.equal(true);
    })

    it("Should add copies to an existing book", async function () {
      const { bookLibrary, bookId, copies, title } = await loadFixture(deployBookLibrary);

      const newCopies = 3

      await bookLibrary.addBook(title, newCopies);

      const book = await bookLibrary.books(bookId);
      const totalCopies = copies + newCopies
      expect(book.copiesAvailable).to.equal(totalCopies);
    })

    it("Should throw when book data is not valid", async function () {
      const { bookLibrary } = await loadFixture(deployBookLibrary);

      expect(bookLibrary.addBook("", 1)).to.be.revertedWith(
        "Book data is not valid"
      );
    })

    it("Should throw when not owner tries to add book", async function () {
      const { bookLibrary, otherAccount } = await loadFixture(deployBookLibrary);

      expect(bookLibrary.connect(otherAccount).addBook("Book3", 1)).to.be.revertedWith("Ownable: caller is not the owner");
    })
  })

  describe("BorrowBook", function () {
    it("Should be able to borrow available book", async function () {
      const { bookLibrary, bookId, copies } = await deployBookLibrary();

      await bookLibrary.borrowBook(bookId)

      expect((await bookLibrary.books(bookId)).copiesAvailable).to.equal(copies - 1)
    })

    it("Should revert when there are no book copies available", async function () {
      const { bookLibrary, otherAccount, bookId } = await deployBookLibrary();

      await bookLibrary.borrowBook(bookId)

      expect(bookLibrary.connect(otherAccount).borrowBook(bookId)).to.be.revertedWith("No copies available");
    })

    it("Should revert when user has already borrowed book", async function () {
      const { bookLibrary, bookId, title } = await deployBookLibrary();

      await bookLibrary.borrowBook(bookId)
      await bookLibrary.addBook(title, 1)

      expect(bookLibrary.borrowBook(bookId)).to.be.revertedWith("You have already borrowed this book");
    })
  })

  describe("ListAvailableBooks", function () {
    it("Should list available books correctly when copies are available", async function () {
      const { bookLibrary, title, copies } = await loadFixture(deployBookLibrary);

      const availableBooks = await bookLibrary.listAvailableBooks();

      expect(availableBooks.length).to.equal(1);
      expect(availableBooks[0].title).to.equal(title);
      expect(availableBooks[0].copiesAvailable).to.equal(copies);
    });

    it("Should retrun empty list when no book copies available", async function () {
      const { bookLibrary, bookId } = await loadFixture(deployBookLibrary);

      await bookLibrary.borrowBook(bookId)
      const availableBooks = await bookLibrary.listAvailableBooks()
      expect(availableBooks).to.be.deep.equal([])
    })
  })


  it("Should revert whe trying to list book borrowers for non existent book", async function () {
    const { bookLibrary } = await loadFixture(deployBookLibrary);
    const id = ethers.solidityPackedKeccak256(["string"], ["NoNExistent"])

    expect(bookLibrary.listBookBorrowers(id)).to.revertedWith("Book with this ID does not exist")
  })

  describe("ReturnBook", function () {
    it("Should be able to return book when book was borrowed", async function () {
      const { bookLibrary, owner, bookId } = await loadFixture(deployBookLibrary);

      await bookLibrary.borrowBook(bookId)
      const bookBorrowers = await bookLibrary.listBookBorrowers(bookId)
      await bookLibrary.returnBook(bookId)

      expect(bookBorrowers).to.deep.equal([owner.address])
    })

    it("Should revert when trying to return a book that has not been borrow by user", async function () {
      const { bookLibrary, bookId } = await loadFixture(deployBookLibrary);
      const retrunBookTx = bookLibrary.returnBook(bookId)

      expect(retrunBookTx).to.be.revertedWith("You have not borrowed this book")
    })
  })
});