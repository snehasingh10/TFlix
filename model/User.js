const { Schema, model } = require('mongoose')
const { hash } = require('bcrypt')

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: { type: String, default: '' },
    username: { type: String },
    gender: { type: String },
    name: { type: String },
    country: { type: String },
    status: { type: Boolean },
    fromSso: { type: Boolean },
    ssoId: { type: String },
    verified: { type: Boolean },
    liked: { 
        type: Object,
        default: {
            "movie": [],
            "web": []
        }
    },
    watchList: { 
        type: Object,
        default: {
            "movie": [],
            "web": []
        }
    },
    verificationCode: { type: Number },
    purchacedShows: { 
        type: Object,
        default: {
            "movie": [],
            "web": []
        }
    },
    isPremium: { type: Boolean },
    planTill: { type: Date },
    packageId: { type: String },
    trail: { type: Boolean },
    storedLangs: { type: Array }
}, {
    timestamps: true
})

userSchema.pre('save', async function(next) {
    this['fromSso'] = false

    if(this.password) this.password = await hash(this.password, 10)
    else{ 
        this['fromSso'] = true
        this['username'] = this.ssoId
    }
    next()
})

module.exports = model('Users', userSchema)