//multer-storage-cloudinary is used when after the file has been sent on the form, multer will parse it and then that parsed code is accepted by multer-storage-cloudinary and the file is uploaded to cloudinary, and then the links obtained from storing by cloudinary is sent with multer storage cloudinary so that they can be used in the app
//https://www.npmjs.com/package/multer-storage-cloudinary

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({         //compulsory to set up step 1
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  //The caps lock part in the .env file can be any name you want, but both here and there have to match.
    api_key: process.env.CLOUDINARY_KEY,    //the cloud_name, and api_key key names have to be the same and not different
    api_secret: process.env.CLOUDINARY_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary,     //this is the cloudinary object we configured above in line 6
    params: {       //as per the multer cloudinary page in npm, this has to be put as part of the format
          folder: 'RestaurantLand',      //folder in cloudinary which we should store things in
          allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

module.exports = {
    cloudinary, //line 6
    storage     //line 12
}