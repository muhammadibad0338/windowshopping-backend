const mongoose = require('mongoose');

const carousellSchema = mongoose.Schema({
    caption: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
})

carousellSchema.virtual('id').get(function () {
    return this._id.toHexString();
})

carousellSchema.set('toJSON', {
    virtuals: true
})

exports.Carousell = mongoose.model('Carousell', carousellSchema);
