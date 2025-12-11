const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const Device = require("../device/device")

const clientSchema = mongoose.Schema({
    _id : {type:mongoose.Schema.Types.ObjectId,unique:true},
    nom:{type: String,required:true},
    ville : {type:String,required:true},

});
clientSchema.pre('deleteOne', async function (next) {

  try {
    const client = await this.model.findOne(this.getFilter());

    
    if (client) {
      
      await Device.deleteMany({ client: client._id });
    }
    next();
  } catch (err) {
    next(err);
  }
});


module.exports = mongoose.model('client', clientSchema)