const { Carousell } = require('../models/carousell');
const { Product } = require('../models/product');
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


router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const product = await Product.findById(req.body.product)
    if (!product) return res.status(400).send("Invalid product")
    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    let carousell = new Carousell({
        caption: req.body.caption,
        image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
        product: req.body.product,
    });

    let addedCarousell = await carousell.save();
    if (!addedCarousell) {
        return res.status(500).json({ message: 'Carousell can not be added' })
    }
    return res.send(addedCarousell)
})

router.get(`/`, async (req, res) => {
    const carousellList = await Carousell.find();

    if (!carousellList) {
        res.status(500).json({ success: false })
    }
    res.status(200).send(carousellList);
})

router.delete(`/:id`, async (req, res) => {
    Carousell.findByIdAndRemove(req.params.id).then(carousell => {
        if (carousell) {
            return res.status(200).json({
                success: true,
                message: 'carousell deleted successfully'
            })
        } else {
            return res.status(404).json({ success: false, message: "carousell not found" })
        }
    })
        .catch(err => {
            return res.status(400).json({ success: false, error: err })
        })
})


module.exports = router;