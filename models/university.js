// the mongoose model for a university


const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const ImageSchema = new Schema({
    url: String,
    filename: String
});
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const UniversitySchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    name: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'], // 'geometry.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    tuition: Number,
    description: String,
    images: [ImageSchema],
    // store reviews in an array that refers to their review IDs inside university
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

UniversitySchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/universities/${this._id}">${this.name}</a><strong>
    <p>${this.description.substring(0, 60)}...</p>`;
});

// the university instance that is deleted will be passed in to the middleware function as a parameter
UniversitySchema.post('findOneAndDelete', async function (doc) {
    // if there is a document to be deleted
    if (doc) {
        await Review.deleteMany({
            // remove reviews whose _id fields are in the document's reviews
            _id: {
                $in: doc.reviews
            }
        })
    }
});

// export this model to use it in other places of the application
module.exports = mongoose.model('University', UniversitySchema);