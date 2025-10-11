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
    borrowedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    borrowedDuration:{
        type:Number,
        min:1,
        max:7,
        default:1
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
        title:String,
        maxLength:100
    },
    isAvailable:{
        type:Boolean,
        default:true,
    },
    borrowedAt:{
        type:Date
    },
    dueDate:{
        type:Date
    }


},{
    timestamps:true
})
bookSchema.pre("save",function(next){
    if(this.isModified("borrowedBy") && this.borrowedBy){
        this.borrowedAt = new Date()
        this.dueDate = new Date(Date.now()+(this.borrowedDuration ||1)*24*60*60*1000);
        this.isAvailable=false;
    }
    else if(this.isModified("borrowedBy")&&!this.borrowedBy){
        this.isAvailable=true;
        this.borrowedAt=null;
        this.dueDate=null;
    }
    next();
})

export const Book = mongoose.model("Book",bookSchema);