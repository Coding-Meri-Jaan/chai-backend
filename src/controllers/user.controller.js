import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from  "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

//method to register a user
const registerUser = asyncHandler( async (req, res) => {
    //step1 : get the user data from the request body or frontend
    //step2 :  validate the user data
    //step3 : check if user already exists
    //step4 :  check for images and avatar
    //step5 : upload them to cloudinary
    //step6 : create a user object - create entry in db
    //step7 : remove password and refresh token field from response
    //step8 :check for user creation
    //step9 : return response to frontend

    

    //get user details from frontend
    const { fullname, email, username, password } = req.body;
    console.log("email: ", email);


    //validation
    if (
        [fullname,email,username,password].some((field)=>field?.trim()==="")
    ) {
        throw new ApiError(400, "All fields are required")
    }
 
   
    //find me a user who matches with this email
   const existedUser= User.findOne({
        $or:[{username},{email}]
    })

    if (condition) {
         throw new ApiError(409, "Username or Email already exists")
     }

   
    //handling and checking images
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;


    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file  is required")
    }

    //upload them to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
    
    //create a user object
      //communicate with database with  user object
   const user = await User.create({
        fullName,
        avatar: avatar.url,
        //agar coverimage me url hai to nikal lo else null
        coverImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase(),
        
   })
    //mongodb will allocate an _id with every entry to remove password and refresh token  from response

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"  // -password means I don't want password 
    ) 
   
    //check for  user existence
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
    )

})

export {registerUser,}