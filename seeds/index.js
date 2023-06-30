const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

main().catch(err => {
    console.log('Oh no! There is a Mongo connection error!');
    console.log(err)
});

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log('I\'m connected to Mongo!');
}

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6492120521e5936108c3468c',
            location: `${ cities[random1000].city }, ${ cities[random1000].state }`,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            title: `${ sample(descriptors) } ${ sample(places) }`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dikn30bhp/image/upload/v1687532482/YelpCamp/hmf2e7zkvd4vemjayyty.jpg',
                    filename: 'YelpCamp/hmf2e7zkvd4vemjayyty'
                },
                {
                    url: 'https://res.cloudinary.com/dikn30bhp/image/upload/v1687532483/YelpCamp/e32zl0yixom65wvwtyd1.jpg',
                    filename: 'YelpCamp/e32zl0yixom65wvwtyd1'
                },
                {
                    url: 'https://res.cloudinary.com/dikn30bhp/image/upload/v1687533510/YelpCamp/mhu9jy6wzgidbfdv2pa1.jpg',
                    filename: 'YelpCamp/mhu9jy6wzgidbfdv2pa1'
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident deserunt dignissimos rerum ducimus porro magnam omnis repellat dolor cupiditate libero consequuntur amet incidunt, repudiandae suscipit assumenda commodi, eveniet autem. Similique.',
            price: price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})