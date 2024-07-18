import ApiResponse from '../Utils/ApiResponse.js'
import { asyncHandler } from '../Utils/asyncHandler.js'

const ping = asyncHandler(async (req, res)=>{
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                'Active server here'
            )
        )
})

export {ping}