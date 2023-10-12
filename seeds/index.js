// seed a new set of universities in our test database (run index.js)


const mongoose = require('mongoose');
const axios = require('axios');

const cities = require("./cities")
const University = require('../models/university');

// open the connection to the university database
mongoose.connect('mongodb://localhost:27017/real-university');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', () => {
    console.log('Database connected')
});

async function seedImg() {
    try {
        const resp = await axios.get('https://api.unsplash.com/photos/random', {
            params: {
                client_id: 'q_0eWnn677Wa7LSNFXoZxWvd8RsSEqlNHc04P4WZJaA',
                collections: 228447,
            },
        })
        return resp.data.urls.small
    } catch (err) {
        console.error(err)
    }
}

const seedDB = async () => {
    // delete all exisitng data in the database
    await University.deleteMany({});

    for (let i = 0; i < 200; i++) {
        const randNum = Math.floor(Math.random() * 1000);
        const randTuition = Math.floor(Math.random() * 100000);

        const uni = new University({
            author: '64fff144ebdc128fc0d94738',
            name: `University of ${cities[randNum].city}`,
            location: `${cities[randNum].city}, ${cities[randNum].state}`,
            geometry: { type: "Point", coordinates: [cities[randNum].longitude, cities[randNum].latitude] },
            tuition: randTuition,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam, aspernatur voluptatibus. Vel error exercitationem molestias sequi consequuntur perferendis quos distinctio reprehenderit ipsa provident odit autem debitis, dolore veniam quaerat est.,',
            images: [
                {
                    url: 'https://res.cloudinary.com/dgeqifdzu/image/upload/v1695011855/RealUniversity/kz0cnogsyoicmj9jfdoo.webp',
                    filename: 'kz0cnogsyoicmj9jfdoo'
                },
                {
                    url: 'https://res.cloudinary.com/dgeqifdzu/image/upload/v1695011855/RealUniversity/mjtnvt2vdabkkhtnuv4v.webp',
                    filename: 'mjtnvt2vdabkkhtnuv4v'
                }
            ],
        })

        // save the new university to the database
        await uni.save();
    }
}

// run the seeding function and then close the connection to the university database
seedDB().then(() => {
    mongoose.connection.close();
})