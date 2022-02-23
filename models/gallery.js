const mongoose = require('mongoose');

const gallerySchema = mongoose.Schema({
    imageUrl: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    }
})

gallerySchema.virtual('id').get(function () {
    return this._id.toHexString();
})

gallerySchema.set('toJSON', {
    virtuals: true
})


exports.Gallery = mongoose.model('Gallery', gallerySchema);