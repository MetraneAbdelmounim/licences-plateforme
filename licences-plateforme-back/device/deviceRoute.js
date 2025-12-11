const authUser = require('../middlewares/authUser')
const authAdmin = require('../middlewares/authAdmin')
const authProject = require('../middlewares/authProjects')
const licenceGuard = require('../middlewares/licenceGuard')
const deviceController = require('./deviceController')
let path = require('path')
let express = require('express');
let router = express.Router();
const multer = require('multer')
const auth = require('../auth/auth')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join('uploads/'));
    },
    filename: function (req, file, cb) {
        cb(null, path.join(Date.now().toString() + file.originalname))
    }
});

var upload = multer({
    storage: storage
});

router.post('',authAdmin, deviceController.addDevice)
router.post('/file',authAdmin, upload.single('file'), deviceController.addDeviceFromFile)
router.get('',authUser, deviceController.getAllDevices)
router.get('/clients/:idClient',authUser, deviceController.getDevicesByClient)
router.delete('/:idDevice',authAdmin, deviceController.deleteDevice)
router.put('/:idDevice',authAdmin, deviceController.updateDevice)
router.get('/export',authAdmin, deviceController.exportAllDevices)
router.get('/export/:idClient',authUser, deviceController.exportAllDevicesByClient)

module.exports = router
