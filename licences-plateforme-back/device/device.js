const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');


const deviceSchema = mongoose.Schema({
    _id : {type:mongoose.Schema.Types.ObjectId,unique:true},
    client:{type:mongoose.Schema.Types.ObjectId,ref: 'client' },
    reference: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: false
    },
    vendor: {
      type: String,
      required: true
    },
    serialNumber: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
  },
  )
deviceSchema.pre('save', function (next) {
  const parseDate = (str) => {
    if (!str) return null;
    const parts = str.split('-'); // expected format dd-mm-yyyy
    if (parts.length !== 3) return null;
    const [dd, mm, yyyy] = parts;
    return new Date(`${yyyy}-${mm}-${dd}`); // convert to ISO format
  };

  if (typeof this.startDate === 'string') {
    this.startDate = parseDate(this.startDate);
  }
  if (typeof this.endDate === 'string') {
    this.endDate = parseDate(this.endDate);
  }

  next();
});
deviceSchema.pre('find',function(next) {
    this.populate('client');
    next();
})
deviceSchema.pre('findOne',function(next) {
    this.populate('client');
    next();
})
module.exports = mongoose.model('Device', deviceSchema)