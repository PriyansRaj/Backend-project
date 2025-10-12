import { Book } from "../models/Book.model.js";
import { User } from "../models/User.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import Response from "../utils/ResponseHandler.js";
import { BorrowRecord } from "../models/BorrowRecord.model.js";
export const createBook = async (req,res)=>{
    try {
        const {title,genre,description} = req.body;
        if(!title || !genre || !description){
            throw new ErrorHandler(400,"All the fields must be filled")
        }
        const isExist = await Book.findOne({title});
        if(isExist)  throw new ErrorHandler(401,"Book already exist")
        const book = new Book({title,genre,description});
        const newBook = await book.save();
        if(!newBook) throw new ErrorHandler(401,"Unable to save the book");
        return res.status(201).json(new Response(201,newBook,"Book saved successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(new Response(error.statusCode || 500,{},error.message || "Internal server error: while saving book"));
    }
}


export const deleteBook = async(req,res)=>{
    try {
        const {title} = req.params;
        if(!title) throw new ErrorHandler(400,"Title must be given");
        const book = await Book.findOneAndDelete({title});
        if(!book) throw new ErrorHandler(404,"Book not found");
        return res.status(200).json(new Response(200,{},"Book deleted successfully"));

    } catch (error) {
         return res.status(error.statusCode || 500).json(new Response(error.statusCode || 500,{},error.message || "Internal server error: Unable to delete book"));
    }
}

export const updateBook = async(req,res)=>{
    try {
        const {title,genre,description} = req.body;
        if(!title ||  !genre || !description ) throw new ErrorHandler(400,"All fields are required");
        const updatedbook = await Book.findOneAndUpdate(
            {
                title
            },
            {
                $set: {genre,description}
            },

            {
                new:true,
                runValidators:false
            }
        )
        if(!updatedbook) 
            throw new ErrorHandler(404,"Book not found");
        return res.status(200).json(new Response(200,updatedbook,"Book updated successfully"))

        
    } catch (error) {
        return res.status(error.statusCode || 500).json(new Response(error.statusCode || 500,{},error.message || "Internal server error: unable to update the book"))
        
    }
}

export const getBookByTitle = async (req,res)=>{
    try {
        const {title} = req.params;
        if(!title) throw new ErrorHandler(400,"Title is required");
        const book = await Book.findOne({title}).populate("borrowRecords");
        if(!book) throw new ErrorHandler(404,"Book not found");
        return res.status(200).json(new Response(200,book,"Book fetched successfully"));
    } catch (error) {
          return res.status(error.statusCode || 500).json(new Response(error.statusCode || 500 ,{},error.message || "Internal server error: Unable to fetch book"));
    }
}

export const borrowedHistoryByTitle = async (req,res)=>{
    try {
        const {title}= req.params;
        if(!title)  throw new ErrorHandler(400,"Title is required"); 
        const book = await Book.findOne({title}).populate({
            path:"borrowRecords",
            populate:[{path:"user",select:"username fullName email"},
                {path:"book",select:"title"}
            ],
        });
        if(!book) throw new ErrorHandler(404,"Book not found");
        return res.status(200).json(new Response(200,book.borrowRecords,"History fetched Successfully"))
    } catch (error) {
        return res.status(error.statusCode || 500).json(new Response(error.statusCode || 500,{},error.message || "Internal server error: unable to fetch borrow history"))
    }
}

export const borrowBook = async(req,res)=>{
    try {
        const {username,title,durationDays} = req.body;
        if (!username || !title || !durationDays)
            throw new ErrorHandler(400, "All fields are required");

        const user = await User.findOne({username});
        const book = await Book.findOne({title});
        if(!user || !book){
            throw new ErrorHandler(404,"User or book not found");
        }
        if(!book.isAvailable){
            return res.status(400).json(new Response(400,{},"Book is not available for borrow"));
        }
        const dueDate = new Date(Date.now() + durationDays * 24*60*60*1000);
        const record = new BorrowRecord({
            user:user._id,
            book:book._id,
            dueDate
        })
        user.borrowRecords.push(record._id);
        book.borrowRecords.push(record._id);
        book.isAvailable = false;
        await user.save();
        await book.save();
        await record.save();
        return res.status(201).json(new Response(201,record,"Book borrowed successfully"));
    } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new Response(
          error.statusCode || 500,
          {},
          error.message || "Internal server error: Unable to borrow book"
        )
      );
    }
}



export const returnBook = async(req,res)=>{
    try {
        const {username,title} = req.body;
        if(!username || !title)  throw new ErrorHandler(400, "Username and Title are required");
        const user = await User.findOne({ username });
        const book = await Book.findOne({ title });
        if (!user || !book)
            throw new ErrorHandler(404, "User or Book not found");
        const record = await BorrowRecord.findOne({
            user:user._id,
            book:book._id,
            status:"Borrowed",
        })
        if(!record)  throw new ErrorHandler(404, "No active borrow record found");
        record.status= "Returned";
        record.returnedAt =new Date();
        await record.save();
        book.isAvailable = true;
        await book.save();
          return res
      .status(200)
      .json(new Response(200, record, "Book returned successfully"));
    } catch (error) {
        return res
      .status(error.statusCode || 500)
      .json(
        new Response(
          error.statusCode || 500,
          {},
          error.message || "Internal server error: Unable to return book"
        )
      );
        
    }
}

export const getUserRecord = async(req,res)=>{
    try {
        const {username} = req.params;
        if(!username) throw new ErrorHandler(400, "Username is required");
        const user = await User.findOne({username}).populate({
            path:"borrowRecords",
            populate:[{
                path:"book", select:"title genre"
            },{
              path:"user",select:"username borrowRecords"
            }]
        })
        if(!user) throw new ErrorHandler(404,"User record not found");
        return res.status(200).json(new Response(200, user, "User record returned successfully"));
    } catch (error) {
         return res
          .status(error.statusCode || 500)
          .json(
            new Response(
              error.statusCode || 500,
              {},
              error.message || "Internal server error: Unable to return user record"
            )
          );
    }
}
export const getAllBorrowedBooks = async (req, res) => {
  try {
    const borrowed = await BorrowRecord.find({ status: "Borrowed" })
      .populate("user", "username fullName")
      .populate("book", "title genre");
    return res.status(200).json(new Response(200, borrowed, "All borrowed books fetched successfully"));
  } catch (error) {
    return res.status(error.statusCode || 500).json(
      new Response(error.statusCode || 500, {}, error.message || "Internal server error: unable to fetch borrowed books")
    );
  }
};


export const booksAvailability = async (req, res) => {
  try {
    const { titles } = req.query;
    if (!titles) throw new ErrorHandler(400, "Titles are required");

    const titlesArray = titles.split(",");
    const books = await Book.find({ title: { $in: titlesArray } }, "title isAvailable");

    return res.status(200).json(new Response(200, books, "Books availability fetched successfully"));
  } catch (error) {
    return res.status(error.statusCode || 500).json(
      new Response(error.statusCode || 500, {}, error.message || "Internal server error: unable to fetch books status")
    );
  }
};

export const bookIsAvailable = async (req, res) => {
  try {
    const { title } = req.params;
    if (!title) throw new ErrorHandler(400, "Title is required");

    const book = await Book.findOne({ title });
    if (!book) throw new ErrorHandler(404, "Book not found");

    return res.status(200).json(
      new Response(200, { title: book.title, isAvailable: book.isAvailable }, "Book availability fetched successfully")
    );
  } catch (error) {
    return res.status(error.statusCode || 500).json(
      new Response(error.statusCode || 500, {}, error.message || "Internal server error: unable to fetch book status")
    );
  }
};


export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().select("title genre isAvailable");
    return res.status(200).json(new Response(200, books, "All books fetched successfully"));
  } catch (error) {
    return res.status(error.statusCode || 500).json(
      new Response(error.statusCode || 500, {}, error.message || "Internal server error: unable to fetch all books")
    );
  }
};

