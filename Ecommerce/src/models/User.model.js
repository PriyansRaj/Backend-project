import mongoose, {Schema} from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


const userSchema = new Schema({
    name:{
        type:String,
        maxlength:[40,"Name should not exceed 40 characters"],
        required:true,
        lowercase:true,
        trim:true,
        required:[true, "Name is required"],
        index:true
    },
    email:{
        type:String,
        required:[true, "Email is required"],
        validate:{
            validator:function(v){
                return validator.isEmail(v);
            },
            message:props=> `${props.value} is not a valid email`
        },
        trim:true,
        index:true,
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        trim:true,
        minlength:[8,'Password must be aleast 8 characters long'],
        select:false,
    },
    role:{
        type:String,
        enum:['customer','worker','manager'],
        default:'customer',
        required:true,
    },
    refreshToken:{
        type:String,
    },
     phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"], // adjust if international numbers are needed
    }
},{timestamps:true})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) next()
    this.password = await bcrypt.hash(this.password,11);
    next()
})
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.methods.createAccessToken = function (){
    return jwt.sign(
        {
            _id:this._id,
            name:this.name,
            email:this.email

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
         expiresIn: process.env.ACCESS_TOKEN_EXPIRY  
        }
    )
}

userSchema.methods.createRefeshToken = function (){
    return jwt.sign(
        {
            id:this._id,


        },
        process.env.REFRESH_TOKEN_SECRET,
        {
         expiresIn: process.env.REFRESH_TOKEN_EXPIRY  
        }
    )
}

export const User = mongoose.model("User",userSchema);

