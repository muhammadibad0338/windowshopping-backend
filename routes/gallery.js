const { Gallery } = require('../models/gallery');
const express = require('express');
const router = express.Router();



router.get(`/`, async (req, res) => {
    try {

        const imageList = await Gallery.find();

        if (!imageList) {
            res.status(500).json({ success: false })
        }
        res.status(200).send(imageList);
    }
    catch (error) {
        res.status(404).json({
            message: 'fail',
            error
        })
    }
})


router.post(`/`, async (req, res) => {
    let image = new Gallery({
        imageUrl: req.body.imageUrl,
    });

    image = await image.save();

    if (!image) {
        return res.status(404).send("the image can not be created");
    }
    res.send(image);
});


router.delete(`/:id`, async (req, res) => {
    try {

        Gallery.findByIdAndRemove(req.params.id).then(image => {
            if (image) {
                return res.status(200).json({
                    success: true,
                    message: 'Image deleted successfully'
                })
            } else {
                return res.status(404).json({ success: false, message: "image not found" })
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

module.exports = router;