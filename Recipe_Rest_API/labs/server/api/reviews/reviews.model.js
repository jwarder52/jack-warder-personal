import mongoose from 'mongoose';
let Schema = mongoose.Schema;

//Reviews Schema
//Required attributes:
// Review description
// Review rating (i.e. number of stars)
// Date review was created
// This should be set by the server
// User creating review (implemented as an ObjectId referencing users collection)
let reviewSchema = Schema ({
    description: {type: String, required: true},
    rating: {type: Number, min: 1, max: 5, required: true},
    dateCreated: {type: Date, default: Date.now, required: true},
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true}
})

const Review = mongoose.model('Review', reviewSchema);
export { Review };