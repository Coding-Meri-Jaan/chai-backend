import { asyncHandler } from "../utils/asyncHandler.js"


//method to register a user
const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json(
        {
        message:"chai and code"
        }
    )
})

export {registerUser}