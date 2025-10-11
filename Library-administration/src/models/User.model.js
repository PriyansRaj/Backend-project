import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
const userSchema = new Schema({
    username:{
        type:String,
        unique:true,
        lowercase:true,
        trim:true,
        required:[true,"Username is required"],
        minLength: [3, 'Username must be at least 3 characters long'],
        maxLength: [20, 'Username cannot exceed 20 characters'],
        index:true
    },
    fullName:{
        
        type:String,
        trim:true,
        required:[true,"Full name is required"],
  
    },
    email:{
        type:String,
        trim:true,
        required:true,
        unique: true,
        match: [/.+\@.+\..+/, "Please enter a valid email address"]
    },
    role:{
        type:String,
        enum:['Admin','User'],
        default:'User',
        required:true,
    },
    password:{
         type:String,
        trim:true,
        required:[true,"password is required"],
        minLength: [3, 'password must be at least 3 characters long'],
        maxLength: [20, 'password cannot exceed 20 characters']
    },
    refreshToken:{
        type:String
    },
    phoneNum:{
        type:Number,
        max:[10,"Phone number must not exceed 10 numbers"],
        min:[10,'Phone number must be of length 10'],
    },
    isActive:{
        type:Boolean,
        default:true,
    },
    isSupended:{
        type:Boolean,
        default:false,
    }

},{timestamps:true})
userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10);
    next()
})

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password);
}


userSchema.methods.generateAccessToken = function(){
   return jwt.sign(
        {
            _id: this._id,
            username:this.username,
            email:this.email,
            role:this.role

        },
        process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            username:this.username
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)