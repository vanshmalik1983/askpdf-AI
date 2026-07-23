import mongoose from "mongoose";

const uri =
  "mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.fg67tqe.mongodb.net/?retryWrites=true&w=majority";

async function main() {
  try {
    await mongoose.connect(uri);
    console.log("CONNECTED");
  } catch (err) {
    console.log(err);
  }
}

main();