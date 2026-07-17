import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const addressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
    },

    state:{
    type:String,
    required:true,
    trim:true
    },

    city:{
    type:String,
    required:true,
    trim:true
    },

    landmark: String,

    addressLine: {
      type: String,
      required: true,
    },
    country: {
        type: String,
        default: "India",
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      minlength: 3,
      maxlength: 20,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    phone: {
    type: String,
    required: true,
    match: [/^[6-9]\d{9}$/, "Invalid phone number"],
    default: "",
    },

    avatar: {
  url: {
    type: String,
    default: "",
  },
  public_id: {
    type: String,
    default: "",
  },
},

    role: {
      type: String,
      enum: ["customer", "admin", "seller"],
      default: "customer",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
     type: Date,
    },

    provider: {
        type: String,
         enum: ["local", "google"],
        default: "local",
    },

    refreshToken: {
     type: String,
     default: "",
     select: false,
    },
    resetPasswordToken: String,

    resetPasswordExpiry: Date,

    verificationToken: String,

    verificationExpiry: Date,

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    addresses: [addressSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  },
  
);

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);

  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      sub: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    fullName: this.fullName,
    username: this.username,
    email: this.email,
    avatar: this.avatar,
    role: this.role,
  };
};

userSchema.set("toJSON", {
  transform(doc, ret) {
    delete ret.password;
    delete ret.refreshToken;
    return ret;
  },
});

userSchema.virtual("addressCount").get(function(){
   return this.addresses.length;
});

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

export default User;