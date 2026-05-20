const User = require("../models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


const loginUser = async(req,res) =>{

    try{
        const { email,password } = req.body;

        if(!email || !password){
            return res.status(404).json(
                {
                    message : "Email and password required"
                }
            )
        }

        const user = await User.findOne({ email });

        if(!user){
            return res.status(404).json({
                message : "user not found"
            })
        }

        const isMatch = await bcrypt.compare(
            password,user.password
        )

        if(!isMatch){
            return res.status(404).json({
                message : "password is incorrect"
            })
        }

        const token = jwt.sign(
            {
                id : user._id,
                role : user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        )

        return res.status(201).json({
            success : true,
            token,
            user : {
                id : user._id,
                name : user.name,
                role : user.role,
                email : user.email
            }
        })

    }
    catch(e){
        res.status(404).json({
            message : "error message"
        })
    }
};


const signinUser = async(req,res) =>{

    try{
        const { name,email,password,role } = req.body;

        if(!email || !name || !password){
            return res.status(404).json({
                message : "All fields are mandatory"
            })
        }

        const existenceOfUser = await User.findOne( {email} );
        if(existenceOfUser){
            return res.status(404).json({
                message : "User already registered"
            });
        }
        
        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = new User({
            name,
            email,
            password : hashedPassword,
            role
        });

        await newUser.save();

        const token = jwt.sign(
            {
                id : newUser._id,
                role : newUser.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        )

        return res.status(201).json({
            success : true,
            token,
            user : {
                id : newUser._id,
                name : newUser.name,
                role : newUser.role,
                email : newUser.email
            }
        })
    }
    catch(e){
        res.status(500).json({
            message : e.message
        })
    }
};

module.exports = {loginUser,signinUser}; 