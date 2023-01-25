const mongoose = require("mongoose")

const minigameSchema = new mongoose.Schema({
    angle: {type: Number, required: true},
    speed: {type: Number, required: true},
    distance: {type: Number, required: true}
})

module.exports = mongoose.model("minigame", minigameSchema)