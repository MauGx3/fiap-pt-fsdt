import { Schema, model } from "mongoose";
import { genSalt, hash, compare } from "bcrypt";
import { randomUUID } from "crypto";

const userSchema = new Schema(
  {
    uuid: {
      type: String,
      default: () => randomUUID(),
      index: true,
      unique: true,
    },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /.+@.+\..+/,
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["admin", "author", "reader"],
      default: "author",
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return compare(candidatePassword, this.password);
};

export default model("User", userSchema);
