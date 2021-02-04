const mongoose = require("mongoose");

const adminNotificationSchema = new mongoose.Schema({

    date_notification: {
        type: Date,
        default: Date.now,
    },

    notification_vue: {
        type: Boolean,
        default: false,
    },

    date_vue: {
        type: Date,
    },

    notification_ouverte: {
        type: Boolean,
        default: false,
    },

    date_ouverte: {
        type: Date,
    },

    message: { type: mongoose.Schema.Types.ObjectId, ref: "Message"},

})

module.exports = AdminNotification = mongoose.model('AdminNotification', adminNotificationSchema);