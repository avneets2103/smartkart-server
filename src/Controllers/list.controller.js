import axios from 'axios'
import { List } from '../Models/list.model.js'
import { Product } from '../Models/product.model.js'
import { Column } from '../Models/column.model.js'
import ApiError from '../Utils/ApiError.js'
import ApiResponse from '../Utils/ApiResponse.js'
import { asyncHandler } from '../Utils/asyncHandler.js'

const getListArray = asyncHandler(async (req, res) => {
    try {
        const lists = await List.find({ userId: req.user._id })

        // Map and sort the fetched lists
        const listArray = lists
            .map((list) => ({
                key: list.key,
                name: list.name,
                emoji: list.emoji,
                lastUpdated: list.updatedAt,
            }))
            .sort((a, b) => b.lastUpdated - a.lastUpdated) // Sort by lastUpdated, latest first

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { listArray: listArray },
                    'Successfully fetched list array'
                )
            )
    } catch (error) {
        throw new ApiError(500, 'Something went wrong in getListArray')
    }
})

const addNewList = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { key, name, emoji, budget } = req.body
    if (name === undefined || key === undefined || emoji === undefined) {
        throw new ApiError(400, 'name, key, emoji and lastUpdated are required')
    }
    if (name === '' || key === '' || emoji === '') {
        throw new ApiError(
            400,
            'name, key, emoji and lastUpdated cannot be empty'
        )
    }

    const list = new List({
        key: key,
        name: name,
        emoji: emoji,
        budget: budget,
        userId: userId,
    })
    const savedList = await list.save()
    if (!savedList) {
        throw new ApiError(500, 'Something went wrong in addNewList')
    }
    return res.json(
        new ApiResponse(200, { list: savedList }, 'Successfully added new list')
    )
})

const deleteList = asyncHandler(async (req, res, next) => {
    try {
        const { key } = req.body

        if (key === undefined) {
            return next(new ApiError(400, 'key is required'))
        }
        if (key === '') {
            return next(new ApiError(400, 'key cannot be empty'))
        }

        const list = await List.findOne({ key: key })
        if (!list) {
            return next(new ApiError(404, 'List not found'))
        }

        await List.deleteOne({ key: key })

        return res.json(
            new ApiResponse(200, { list: list }, 'Successfully deleted list')
        )
    } catch (error) {
        return next(new ApiError(500, 'Something went wrong in deleteList'))
    }
})

const deleteAllLists = asyncHandler(async (req, res, next) => {
    try {
        await List.deleteMany({})
        return res.json(
            new ApiResponse(
                200,
                { message: 'All lists deleted' },
                'Successfully deleted all lists'
            )
        )
    } catch (error) {
        throw new ApiError(500, 'Something went wrong in deleteAllLists')
    }
})

const addProductToList = asyncHandler(async (req, res, next) => {
    try {
        let { listId, productLink, customKeyVals } = req.body;
        if (!listId) return next(new ApiError(400, 'listId is required'));
        if (!productLink) return next(new ApiError(400, 'productLink is required'));
        if (productLink === '') return next(new ApiError(400, 'productLink cannot be empty'));
        if (customKeyVals === undefined) customKeyVals = {};

        const list = await List.findOne({ key: listId });
        if (!list) return next(new ApiError(404, 'List not found'));
        if (list.userId !== req.user._id.toString())
            return next(new ApiError(403, 'You are not authorized to add products to this list'));

        let extractedDetails = {};
        if (productLink.includes('amazon')) {
            function extractASIN(url) {
                const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
                if (asinMatch && asinMatch[1]) {
                    return asinMatch[1];
                } else {
                    return null;
                }
            }
            const productId = extractASIN(productLink);
            if (!productId) return next(new ApiError(400, 'Invalid product link'));

            const options = {
                method: 'GET',
                url: `${process.env.API_URL}${productId}`,
                params: { api_key: process.env.AMAZON_API_KEY },
                headers: {
                    'x-rapidapi-key': process.env.RAPID_API_KEY,
                    'x-rapidapi-host': process.env.RAPID_API_HOST,
                },
            };
            const response = await axios.request(options);
            const productData = response.data;

            if (!productData) throw new Error('No product data found');

            const name = productData.name || 'N/A';
            const brand = productData.brand || 'N/A';
            let pricing = 0;
            if (productData.pricing) {
                pricing = parseFloat(productData.pricing.replace(/[^\d.-]/g, '')) || 0;
            }
            const availability_stock = productData.availability_status
                ? productData.availability_status.toLowerCase().includes('in stock')
                : false;
            const images = productData.images && productData.images.length > 0
                ? productData.images[0]
                : 'N/A';
            let shipping_price = 0;
            if (productData.shipping_price) {
                shipping_price = parseFloat(productData.shipping_price.replace(/[^\d.-]/g, '')) || 0;
            }
            let average_rating = 0;
            if (productData.average_rating) {
                average_rating = parseFloat(productData.average_rating) || 0;
            }
            let total_reviews = 0;
            if (productData.total_reviews) {
                total_reviews = parseInt(productData.total_reviews) || 0;
            }
            const productInfo = {};
            for (const [key, value] of Object.entries(productData.product_information || {})) {
                if (typeof value === 'string' || typeof value === 'number') {
                    productInfo[key] = value;
                }
            }

            extractedDetails = {
                images,
                name,
                brand,
                pricing,
                shipping_price,
                availability_stock,
                average_rating,
                total_reviews,
                ...productInfo,
            };
        } else if (productLink.includes('flipkart')) {
            return next(new ApiError(400, 'Flipkart is not supported yet'));
        } else {
            return next(new ApiError(400, 'Invalid product link or unsupported website'));
        }

        // Create new product
        const newProduct = new Product({
            name: extractedDetails.name,
            productImage: extractedDetails.images,
            link: { uri: productLink, site: 'amazon' },
            utility: 0, // default utility value
            features: [], // to be populated
        });

        // Add custom key-value pairs to features and create necessary columns
        const allKeyVals = { ...extractedDetails, ...customKeyVals };
        for (const [key, value] of Object.entries(allKeyVals)) {
            let column = await Column.findOne({ name: key, List: list._id });
            if (!column) {
                // Create new Column with options array
                column = new Column({ name: key, List: list._id, options: [{ option: value, utility: 0 }] });
                await column.save();
            } else {
                // Check if option already exists, if not, add it
                const existingOption = column.options.find(opt => opt.option === value);
                if (!existingOption) {
                    column.options.push({ option: value, utility: 0 });
                    await column.save();
                }
            }
            newProduct.features.push({ column: column._id, value });
        }

        // Save new product and update list
        await newProduct.save();
        list.products.push(newProduct._id);
        await list.save();

        // Return the newly created product
        return res.json(new ApiResponse(200, newProduct, 'Successfully added product to list'));
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'Something went wrong in addProductToList'));
    }
});

const getListData = asyncHandler(async (req, res, next) => {
    try {
        const { listId } = req.body;
        if (!listId) return next(new ApiError(400, 'listId is required'));

        const list = await List.findOne({ key: listId }).populate('products');
        if (!list) return next(new ApiError(404, 'List not found'));

        const columns = await Column.find({ List: list._id });
        const columnIds = columns.map(col => col._id);

        const products = await Product.find({ _id: { $in: list.products } })
            .populate('features.column')
            .sort({ updatedAt: -1 });

        const tableData = products.map(product => {
            const productData = {
                key: product._id,
                name: product.name,
                productImage: product.productImage,
                link: product.link,
                utility: product.utility,
                features: {},
            };

            columns.forEach(column => {
                const feature = product.features.find(f => f.column._id.toString() === column._id.toString());
                productData.features[column.name] = feature ? feature.value : null;
            });

            return productData;
        });

        // Get all unique feature keys and options
        const featureKeys = new Set(columns.map(col => col.name));
        const uniqueOptions = {};

        products.forEach(product => {
            product.features.forEach(feature => {
                const columnName = feature.column.name;
                if (!uniqueOptions[columnName]) {
                    uniqueOptions[columnName] = new Set();
                }
                uniqueOptions[columnName].add(feature.value);
            });
        });

        // Convert options sets to arrays
        Object.keys(uniqueOptions).forEach(key => {
            uniqueOptions[key] = Array.from(uniqueOptions[key]).map(value => ({ name: value, utility: 0 }));
        });

        const response = {
            columns: Array.from(featureKeys),
            options: uniqueOptions,
            products: tableData,
        };

        return res.json(new ApiResponse(200, response, 'Successfully retrieved list data'));
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'Something went wrong in getListData'));
    }
});

const trial = asyncHandler(async (req, res, next) => {
    
})

export {
    getListArray,
    addNewList,
    deleteList,
    deleteAllLists,
    addProductToList,
    trial,
    getListData,
}
