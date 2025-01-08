const multer = require('multer');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');

/***Multer Photo */
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/users');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
    }
});

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb( new AppError('Not an image. Please upload only image.', 400) , false);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

// 'photo' is the name of the field
exports.uploadUserPhoto = upload.single('photo');
/***End of Multer Photo */

const filterObj = (obj, ...allowedFields) => {
    const  newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj;
}


/**using Factory Functions */
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// do NOT update password with this handler
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
/**end of using Factory Functions */


// exports.getAllUsers = catchAsync (async (req, res, next) => {

//     const user = await User.find();

//     res.status(200).json({
//         status: 'Success!',
//         results: user.length,
//         data: {user}
//     });

// });

exports.getMe = catchAsync( async (req, res, next) => {
    req.params.id = req.user.id;
    next();
});



exports.updateMe = catchAsync(async (req, res, next) => {

    // 1. create error if user POSTs password data
    if(req.body.password || req.body.passwordConfirm) {
        return next (new AppError('This route is not for password updates. Please use update-password route', 400));
    }

    // 2. filtered field to update
    const filteredBody = filterObj(req.body, 'name', 'email');
    if(req.file) filteredBody.photo = req.file.filename;

    // 3. update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true, 
        runValidators: true
    });

    res.status(200).json({
        status: 'Success',
        data: {
            user: updatedUser
        }
    });

});

exports.deleteMe = catchAsync( async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false});

    res.status(204).json({
        status: 'Success',
        data: null
    });
});


exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined! Please use signup instead.'
    });
}
