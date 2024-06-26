const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new.ejs');
}

module.exports.createCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`/campgrounds/${ campground._id }`);
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
    if (!campground) {
        req.flash('error', 'That campground has moved, or does not exist anymore!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show.ejs', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'That campground has moved, or does not exist anymore!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit.ejs', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const newCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); //"..."" is the spread operator
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    newCampground.images.push(...imgs);
    await newCampground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await newCampground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });

    }
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${ newCampground.id }`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}