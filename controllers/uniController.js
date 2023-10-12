const University = require('../models/university');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });

module.exports.index = async (req, res) => {
    const universities = await University.find({});
    res.render('universities/index', { universities });
};

module.exports.renderNewForm = (req, res) => {
    res.render('universities/new');
};

module.exports.create = async (req, res) => {
    const uni = new University(req.body.university);
    const geoData = await geocoder.forwardGeocode({
        query: uni.location,
        limit: 1
    }).send();
    uni.geometry = geoData.body.features[0].geometry;
    uni.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    uni.author = req.user._id;
    await uni.save();
    console.log(uni);
    req.flash('success', 'University created successfully');
    res.redirect(`/universities/${uni._id}`);
};

module.exports.show = async (req, res) => {
    // get the id from the request params, and populate reviews and author values
    const uni = await University.findById(req.params.id).populate({
        path: 'reviews',
        populate: { path: 'author' }
    }).populate('author');
    if (!uni) {
        req.flash('error', 'University not found');
        return res.redirect('/universities');
    }
    res.render('universities/show', { uni });
};

module.exports.renderEditForm = async (req, res) => {
    const uni = await University.findById(req.params.id);
    if (!uni) {
        req.flash('error', 'University not found');
        return res.redirect('/universities');
    }
    res.render('universities/edit', { uni });
};

module.exports.update = async (req, res) => {
    const { id } = req.params;
    // ... is a spread operator that spreads the object
    // new: true would return the modified document rather than the old one
    const uni = await University.findByIdAndUpdate(id, { ...req.body.university }, { new: true });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));

    // update images and save
    uni.images.push(...imgs);
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await uni.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    await uni.save();
    req.flash('success', 'University updated successfully');
    res.redirect(`/universities/${uni._id}`);
};

module.exports.destroy = async (req, res) => {
    await University.findByIdAndDelete(req.params.id);
    req.flash('success', 'University deleted successfully');
    res.redirect('/universities');
};