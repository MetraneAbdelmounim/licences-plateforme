const authUser = require('../middlewares/authUser.js')
const authAdmin = require('../middlewares/authAdmin.js')
const licenceGuard = require('../middlewares/licenceGuard.js')
const clientController = require('./clientController.js')
let path =require('path')
let express = require('express');
let router = express.Router();


router.post('',clientController.addClient)
router.get('',clientController.getAllClients)
router.get('/:idClient',clientController.getClientByID)
router.delete('/:idClient',clientController.deleteClient)
router.put('/:idClient',clientController.updateClient)

module.exports=router