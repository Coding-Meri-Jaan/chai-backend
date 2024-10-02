import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Internal Server Error");
  }
};

//method to register a user
const registerUser = asyncHandler(async (req, res) => {
  // step1 : get the user data from the request body or frontend
  // step2 :  validate the user data
  // step3 : check if user already exists
  // step4 :  check for images and avatar
  // step5 : upload them to cloudinary
  // step6 : create a user object - create entry in db
  // step7 : remove password and refresh token field from response
  // step8 :check for user creation
  // step9 : return response to frontend

  // get user details from frontend
  const { fullname, email, username, password } = req.body;
  console.log("email: ", email);

  //validation
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //find me a user who matches with this email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "Username or Email already exists");
  }

  //handling and checking images
  //   const avatarLocalPath = req.files?.avatar[0]?.path;
  //   const coverImageLocalPath = req.files?.coverImage[0]?.path;
  //   console.log(avatarLocalPath);
  //   console.log(coverImageLocalPath);
  //   if (!avatarLocalPath) {
  //     throw new ApiError(400, "Avatar file  is required");
  //   }

  //upload them to cloudinary
  //   const avatar = await uploadOnCloudinary(avatarLocalPath);
  //   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  //   if (!avatar) {
  //     throw new ApiError(400, "Avatar file is required");
  //   }

  //create a user object
  //communicate with database with  user object
  const user = await User.create({
    fullname,
    // avatar: avatar.url,
    //agar coverimage me url hai to nikal lo else null
    // coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  //mongodb will allocate an _id with every entry to remove password and refresh token  from response

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" // -password means I don't want password
  );

  //check for  user existence
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //req body se data le aao
  //username or email
  //find the user
  //password check
  //access and refresh token
  //send cookie

  const { username, password, email } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  //find the userr
  const user = await User.findOne({ $or: [{ username }, { email }] });

  //check if user exists
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  //passwork check
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new ApiError(401, "Invalid password");
  }

  //access and refresh token
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshTokens(user._id);

  //exclude password and refresh token fields from the user object
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // Find the user by their ID (req.user._id) and update their refreshToken field to undefined (remove it)
  await User.findByIdAndUpdate(
    req.user._id, // The ID of the logged-in user (req.user is set during authentication)
    {
      $set: {
        refreshToken: undefined, // Clear the refresh token from the database
      },
    },
    {
      new: true, // Return the updated user object (though it's not used here)
    }
  );

  // Define options for securely clearing the refreshToken cookie
  const options = {
    httpOnly: true, // Make the cookie inaccessible to JavaScript (for security against XSS attacks)
    secure: true, // Ensure the cookie is only sent over HTTPS connections (for secure transmission)
  };

  // Clear the accessToken cookie (used for authentication) and refreshToken cookie (used to refresh tokens)
  return (
    res
      .status(200) // Send a 200 OK status indicating successful logout
      .clearCookie("accessToken") // Remove the access token from cookies
      .clearCookie("refreshToken", options) // Remove the refresh token with secure options

      // Send a JSON response to the client, indicating the user has been logged out successfully
      .json(new ApiResponse(200, {}, "User logged out"))
  );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // Extract the refreshToken from the request headers (assuming it's sent in the 'Authorization' header
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decidedToken?._id);

    if (incomingRefreshToken != user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshTokens(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

export { registerUser, loginUser, logoutUser };
