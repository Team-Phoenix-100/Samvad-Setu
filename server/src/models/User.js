const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["citizen", "hei", "industry_csr", "government_admin", "admin"],
      default: "citizen",
      required: true,
    },
    // Role-specific optional fields
    institutionName: { type: String }, // for 'hei'
    companyName: { type: String }, // for 'industry_csr'
    department: { type: String }, // for 'government_admin'
    regId: { type: String }, // AISHE Code / CIN

    // Demographic and Location fields
    phone: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["Female", "Male", "Other", "prefer-not-to-say"] },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    district: { type: String },
    pinCode: { type: String },
  },
  { timestamps: true }, // adds createdAt & updatedAt automatically
);

// Before saving a user, hash their password
userSchema.pre("save", async function () {
  // Only hash if password is new or being changed
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to check a plain password against the hashed one
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
