const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
    try{

        const categoryList = await Category.find();
        
        if (!categoryList) {
            res.status(500).json({ success: false })
        }
        res.status(200).send(categoryList);
    }
    catch (error) {
        res.status(404).json({
            message: 'fail',
            error
        })
    }
})

router.put(`/:id`, async (req, res) => {
    try{

        const category = await Category.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
        }, {
            new: true
        });
        
        if (!category) {
            res.status(400).json({ success: false, message: "Category can not be updated" })
        }
        res.send(category);
    }
    catch (error) {
        res.status(404).json({
            message: 'fail',
            error
        })
    }
})


router.get(`/:id`, async (req, res) => {
    try{

        const category = await Category.findById(req.params.id);
        
        if (!category) {
            res.status(500).json({ success: false, message: "Category for this id is not found" })
        }
        res.status(200).send(category);
    }
    catch (error) {
        res.status(404).json({
            message: 'fail',
            error
        })
    }
})

router.post(`/`, async (req, res) => {
    try{

        let category = new Category({
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
        })
        
        category = await category.save()
        
        if (!category) {
            return res.status(404).send('the category can not be created')
        }
        res.send(category)
    }
    catch (error) {
        res.status(404).json({
            message: 'fail',
            error
        })
    }
})

router.delete(`/:id`, async (req, res) => {
    try{

        Category.findByIdAndRemove(req.params.id).then(category => {
            if (category) {
                return res.status(200).json({
                    success: true,
                    message: 'category deleted successfully'
                })
            } else {
                return res.status(404).json({ success: false, message: "Category not found" })
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