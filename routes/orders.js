const { Order } = require('../models/order');
const express = require('express');
const router = express.Router();
const { OrderItem } = require('../models/order-item')

router.get(`/`, async (req, res) => {
    try{
        //populate user with only name    //date ordered newest to oldest
        const orderList = await Order.find().populate('user', 'name').populate({ path: 'orderItems', populate: 'product' }).sort({ 'dateOrdered': -1 });
        
        if (!orderList) {
            res.status(500).json({ success: false })
        }
        res.send(orderList);
    }
    catch (error) {
        res.status(404).json({
            message: 'fail',
            error
        })
    }
})

router.post(`/`, async (req, res) => {
    try {
        const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product
            })

            newOrderItem = await newOrderItem.save();
            return newOrderItem._id
        }))

        const orderItemsIdsResolved = await orderItemsIds

        const totalPrices = await Promise.all(orderItemsIdsResolved.map(async orderItemId => {
            const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price')
            const totalPrice = orderItem.product.price * orderItem.quantity
            return totalPrice
        }))

        const SumOfPrices = totalPrices.reduce((a, b) => a + b, 0)

        console.log(totalPrices, "----------")

        let order = new Order({
            orderItems: orderItemsIdsResolved,
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            status: req.body.status,
            totalPrice: SumOfPrices,
            user: req.body.user,
        })

        order = await order.save()

        if (!order) {
            return res.status(404).send('the order can not be created')
        }
        res.send(order)
    }
    catch (error) {
        res.status(500).json({
            message: 'fail',
            error: err
        })
    }
})


router.get(`/:id`, async (req, res) => {//first which object, second param is fields in object
    try {
        const order = await Order.findByIdAndUpdate(req.params.id)
            .populate('user', 'name')
            .populate({
                path: 'orderItems', populate:
                    { path: 'product', populate: 'category' }
            })

        if (!order) {
            res.status(400).json({ success: false, message: "Order can not be fetched" })
        }
        res.send(order);
    }
    catch (error) {
        res.status(404).json({
            message: 'fail',
            error
        })
    }
})


router.put(`/:id`, async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, {
            status: req.body.status
        }, {
            new: true
        });

        if (!order) {
            res.status(400).json({ success: false, message: "Order can not be updated" })
        }
        res.send(order);
    }
    catch (error) {
        res.status(500).json({
            message: 'fail',
            error: err
        })
    }
})


router.delete(`/:id`, async (req, res) => {
    try {
        Order.findByIdAndRemove(req.params.id).then(async order => {
            if (order) {
                await order.orderItems.map(async orderItem => {
                    await OrderItem.findByIdAndRemove(orderItem)
                })
                return res.status(200).json({ success: true, message: 'Order deleted successfully' })
            } else {
                return res.status(404).json({ success: false, message: "Order not found" })
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
});

router.get('/get/totalsales', async (req, res) => {
    try {
        const totalSales = await Order.aggregate([
            { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }
        ])

        if (!totalSales) {
            return res.status(400).send('The order sales cannot be generated')
        }

        res.send({ totalsales: totalSales.pop().totalsales })
    }
    catch (error) {
        res.json({
            message: 'fail',
            error
        })
    }
})

router.get(`/get/count`, async (req, res) => {
    try {
        const orderCount = await Order.countDocuments((count) => count)

        if (!orderCount) {
            res.status(500).json({ success: false })
        }
        res.send({
            orderCount: orderCount
        });
    }
    catch (error) {
        res.json({
            message: 'fail',
            error
        })
    }
})


router.get(`/get/userorders/:userid`, async (req, res) => {
    try {
        const userOrderList = await Order.find({ user: req.params.userid }).populate({
            path: 'orderItems', populate: {
                path: 'product', populate: 'category'
            }
        }).sort({ 'dateOrdered': -1 });

        if (!userOrderList) {
            res.status(500).json({ success: false })
        }
        res.send(userOrderList);
    }
    catch (error) {
        res.status(404).json({
            message: 'fail',
            error
        })
    }
})

module.exports = router;