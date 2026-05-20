const exp = require("express");
const app = exp();
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db.js");

connectDB();

app.use(exp.json());
const authRoutes = require("./routes/authRoutes");
const functionRoutes = require("./routes/functionRoutes.js");
app.use("/api/auth",authRoutes);
app.use("/api/tasks",functionRoutes);

app.listen(process.env.PORT || 3000 ,() =>{
    console.log("Server running Successfully");
})

