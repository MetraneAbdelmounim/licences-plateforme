const memberController = require('./memberController.js')
let express = require('express');
let router = express.Router();
const authUser = require('../middlewares/authUser.js')
const authAdmin = require('../middlewares/authAdmin.js')
const licenceGuard= require('../middlewares/licenceGuard.js')
router.post('',authAdmin,memberController.addMember)
router.get('',authAdmin,memberController.getAllmembers)
router.delete('/:idMember',authAdmin,memberController.deleteMember)
router.put('/:idMember',authAdmin,memberController.updateMember)
router.put('/password/:idMember',authUser,memberController.changePassword)
router.put('/notifications/:idMember',authAdmin,memberController.changeNotification)

module.exports = router