const { Product } = require('../models/product');
const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
    try {

        // get multiple items from query param ?id=2233,23232
        let filter = {}
        if (req.query.categories) {
            filter = { category: req.query.categories.split(",") }
        }
        const productList = await Product.find(filter).populate('category');

        // const productList = await Product.find().select("name image -_id"); // only returns specified properties
        if (!productList) {
            res.status(500).json({ success: false })
        }
        res.send(productList);
    }
    catch (error) {
        res.status(404).json({
            message: 'fail',
            error
        })
    }
})

router.get(`/:id`, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');

        if (!product) {
            res.status(500).json({ success: false })
        }
        res.send(product);
    }
    catch (error) {
        res.status(404).json({
            message: 'fail',
            error
        })
    }
})

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    try {

        const category = await Category.findById(req.body.category)
        if (!category) return res.status(400).send("Invalid category")
        // const file = req.file;
        // if (!file) return res.status(400).send('No image in the request');

        // const fileName = file.filename;
        // const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        let product = new Product({
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            // image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
            discountPercentage: req.body.discountPercentage
        });

        let addedProduct = await product.save();
        if (!addedProduct) {
            return res.status(500).json({ message: 'Product can not be added' })
        }
        return res.send(addedProduct)
    }
    catch (error) {
        res.status(404).json({
            message: 'fail',
            error
        })
    }
})

router.put(`/:id`, uploadOptions.single('image'), async (req, res) => {
    try {

        if (!mongoose.isValidObjectId(req.params.id)) {
            res.status(400).send("Invalid category")
        }
        const category = await Category.findById(req.body.category)
        if (!category) return res.status(400).send("Invalid category")

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(400).send('Invalid Product!');

        // const file = req.file;
        const image = req.body.image;
        let imagepath;

        if (image) {
            imagepath = image;
        } else {
            imagepath = product.image;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                richDescription: req.body.richDescription,
                image: imagepath,
                brand: req.body.brand,
                price: req.body.price,
                category: req.body.category,
                countInStock: req.body.countInStock,
                rating: req.body.rating,
                numReviews: req.body.numReviews,
                isFeatured: req.body.isFeatured,
                discountPercentage: req.body.discountPercentage
            },
            { new: true }
        );


        if (!updatedProduct)
            return res.status(500).send('the product cannot be updated!');

        res.send(updatedProduct);
    }
    catch (error) {
        res.status(404).json({
            message: 'fail',
            error
        })
    }
})

router.get(`/get/count`, async (req, res) => {
    try {

        const productCount = await Product.countDocuments((count) => count)

        if (!productCount) {
            res.status(500).json({ success: false })
        }
        res.send({
            productCount: productCount
        });
    }
    catch (error) {
        res.status(404).json({
            message: 'fail',
            error
        })
    }
})


router.get(`/get/featured:count`, async (req, res) => {
    try {

        const count = req.params.count ? req.params.count : 0
        // const productList = await Product.find().select("name image -_id"); // only returns specified properties
        const products = await Product.find({ isFeatured: true }).limit(+count);

        if (!products) {
            res.status(500).json({ success: false })
        }
        res.send(products);
    }
    catch (error) {
        res.status(404).json({
            message: 'fail',
            error
        })
    }
})



router.delete(`/:id`, async (req, res) => {
    try {

        Product.findByIdAndRemove(req.params.id).then(product => {
            if (product) {
                return res.status(200).json({
                    success: true,
                    message: 'product deleted successfully'
                })
            } else {
                return res.status(404).json({ success: false, message: "product not found" })
            }
        })
            .catch(err => {
                return res.status(400).json({ success: false, error: err })
            })
    }
    catch (error) {
        res.status(404).json({
            message: 'fail',
            error
        })
    }
})

router.put(
    '/gallery-images/:id',
    uploadOptions.array('images', 10),
    async (req, res) => {
        try {

            if (!mongoose.isValidObjectId(req.params.id)) {
                return res.status(400).send('Invalid Product Id');
            }
            // const files = req.files;
            // const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
            
            let imagesPaths = [];
            const images = req.body.images;
            if (images) {
                images.map((image) => {
                    imagesPaths.push(image);
                });
            }

            const product = await Product.findByIdAndUpdate(
                req.params.id,
                {
                    images: imagesPaths,
                },
                { new: true }
            );

            if (!product)
                return res.status(500).send('the gallery cannot be updated!');

            res.send(product);
        }
        catch (error) {
            res.status(404).json({
                message: 'fail',
                error
            })
        }
    }
);

module.exports = router;