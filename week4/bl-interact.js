const { ethers } = require("ethers");
const BookLibrary = require("./BookLibrary.json");

const run = async function () {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");
    //                                0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
    const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

    const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // Your contract address
    const ownerBookLibrary = new ethers.Contract(contractAddress, BookLibrary.abi, wallet);

    // Creates a book
    const bookName = "Book1"
    // const addBookTx = await ownerBookLibrary.addBook(bookName, 1);
    // const receipt = await addBookTx.wait();
    // if(receipt.status != 1) {
    //     console.log("Failed to add book")
    //     return;
    // }

    // todo extract function
    // const addBookTx1 = await ownerBookLibrary.addBook("Book2", 2);
    // const receipt1 = await addBookTx1.wait();
    // if(receipt1.status != 1) {
    //     console.log("Failed to add book")
    //     return;
    // }

    let availableBooks = await ownerBookLibrary.listAvailableBooks()
    console.log("Available books: " + availableBooks)


    const bookId = ethers.solidityPackedKeccak256(["string"], [bookName]);

    // const borrowBookTx = await ownerBookLibrary.borrowBook(bookId);
    // const receipt2 = await borrowBookTx.wait();
    // if(receipt2.status != 1) {
    //     console.log("Failed to borrow book")
    //     return;
    // }

    availableBooks = await ownerBookLibrary.listAvailableBooks()
    console.log("Available books: " + availableBooks)

    // const returnBookTx = await ownerBookLibrary.returnBook(bookId);
    // const receipt3 = await returnBookTx.wait();
    // if(receipt3.status != 1) {
    //     console.log("Failed to return book")
    //     return;
    // }

    availableBooks = await ownerBookLibrary.listAvailableBooks()
    availableBooks.forEach(book => {
        // results are in BigInt parse them to number
        console.log(Number(book.copiesAvailable))
    });
}

run()