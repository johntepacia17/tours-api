const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name field is required']
    },
    email: {
        type: String,
        required: [true, 'email field is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'invalid email input']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'password field is required'],
        minlength: 8,
        //hidden from mongodb
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'password confirm field is required'],
        validate: {
            // Only works on CREATE and SAVE
            validator: function(el) {
                return el === this.password;
            },
            message: 'password does not match!'
        }   
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre('save', async function(next) {
    // only run this function if password was modified
    if(!this.isModified('password')) return next();

    // hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // delete passwordConfirm
    this.passwordConfirm = undefined;
    next();
});

// check if password has not been modified. if yes, wont proceed to passwordChangedAt property
userSchema.pre('save', async function(next){
    if(!this.isModified('password') || this.isNew) return next();

    // set passwordChangedAt to one second from the past to ensure the token is always created 
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// query middleware || query all users who's active property is set to true
userSchema.pre(/^find/, function(next) {
    // this points to the current query
    this.find({active: {$ne: false}});
    next();

});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        const changeTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changeTimeStamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
                              .createHash('sha256')
                              .update(resetToken)
                              .digest('hex');
    
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const User = mongoose.model('User', userSchema);
module.exports = User;