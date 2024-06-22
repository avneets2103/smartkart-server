import { List } from '../Models/list.model.js';
import ApiError from '../Utils/ApiError.js';
import ApiResponse from '../Utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getListArray = asyncHandler(async (req, res) => {
    try {
        const lists = await List.find({userId: req.user._id});
        
        // Map and sort the fetched lists
        const listArray = lists
            .map(list => ({
                key: list.key,
                name: list.name,
                emoji: list.emoji,
                lastUpdated: list.updatedAt,
            }))
            .sort((a, b) => b.lastUpdated - a.lastUpdated); // Sort by lastUpdated, latest first
        
        return res.status(200).json(
            new ApiResponse(
                200,
                { listArray: listArray },
                'Successfully fetched list array'
            )
        );
    } catch (error) {
        throw new ApiError(500, 'Something went wrong in getListArray');
    }
});

const addNewList = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const {key, name, emoji, budget} = req.body;
    if(name === undefined || key === undefined || emoji === undefined) {
        throw new ApiError(400, 'name, key, emoji and lastUpdated are required');
    }
    if(name==="" || key==="" || emoji==="") {
        throw new ApiError(400, 'name, key, emoji and lastUpdated cannot be empty');
    }

    const list = new List({
        key: key,
        name: name,
        emoji: emoji,
        budget: budget,
        userId: userId
    });
    const savedList = await list.save();
    if(!savedList) {
        throw new ApiError(500, 'Something went wrong in addNewList');
    }
    return res.json(
        new ApiResponse(
            200,
            { list: savedList },
            'Successfully added new list'
        )
    )
});

const deleteList = asyncHandler(async (req, res, next) => {
    try {
        const { key } = req.body;
        
        if (key === undefined) {
            return next(new ApiError(400, 'key is required'));
        }
        if (key === "") {
            return next(new ApiError(400, 'key cannot be empty'));
        }

        const list = await List.findOne({ key: key });
        if (!list) {
            return next(new ApiError(404, 'List not found'));
        }

        await List.deleteOne({ key: key });

        return res.json(
            new ApiResponse(
                200,
                { list: list },
                'Successfully deleted list'
            )
        );
    } catch (error) {
        return next(new ApiError(500, 'Something went wrong in deleteList'));
    }
});

const deleteAllLists = asyncHandler(async (req, res, next) => {
    try {
        await List.deleteMany({});
        return res.json(
            new ApiResponse(
                200,
                { message: 'All lists deleted' },
                'Successfully deleted all lists'
            )
        );
    } catch (error) {         
        throw new ApiError(500, 'Something went wrong in deleteAllLists');
    }
});

export {
    getListArray, 
    addNewList,
    deleteList,
    deleteAllLists
}