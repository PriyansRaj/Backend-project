import mongoose,{Schema} from "mongoose";

const bookSchema = new Schema({
    title:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
        index:true
    },
    genre:{
        type:[String],
        lowercase:true,
        default:[],
        validate:{
            validator:(arr)=>arr.length>0,
            message:"At least one genre is required"
        }
    },
    description:{
        type:String,
        maxlength:[500, "Description must not exceed 500 characters"]
    },
    borrowRecords:[
        {
            type:Schema.Types.ObjectId,
            ref:"BorrowRecord"
        }
    ],
    isAvailable:{
        type:Boolean,
        default:true,
    }


},{
    timestamps:true
})

export const Book = mongoose.model("Book",bookSchema);