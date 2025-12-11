const config = require('../config/config')
const Device = require('./device')
const Analysis = require('../analysis/analysis')
let path = require('path')
let fs = require('fs')
let axios = require('axios').default
var excelToJson = require('convert-excel-to-json');
const mongoose = require('mongoose')
var intToFloat16 = require("ieee754-binary16-modbus").intToFloat16;
const excelJS = require('exceljs');
const ping = require('ping')
const { pin } = require("nodemon/lib/version");
const { log } = require('console')
const analysis = require('../analysis/analysis')
const Client = require('../client/client')



module.exports = {
    addDevice: function (req, res) {
        const id = new mongoose.Types.ObjectId()
        const device = new Device({
            _id: id,
            ...req.body
        });
        device.save()
            .then(() => {
                res.status(201).json({ message: 'Un nouvel équipement a été ajouté avec succès !' })
            })
            .catch(error => {
                res.status(400).send({ error })
            });
    },

    deleteDevice: function (req, res) {
        Device.findOne({ _id: req.params.idDevice })
            .then((device) => {
                if (!device) return res.status(404).json({ message: 'Équipement introuvable' });

                Device.deleteOne({ _id: device._id })
                    .then(() => {
                        res.status(200).json({
                            message: "L'équipement a été supprimé avec succès"
                        });
                    })
                    .catch(error => {
                        res.status(400).json({ error });
                    });
            })
            .catch(error => res.status(500).send(error));
    },

    getDevicesByClient: function (req, res) {
        Device.find({ client: req.params.idClient })
            .then(async devices => {
                if (devices) res.status(200).json(devices);
            })
            .catch(err => res.status(500).send('error : ' + err));
    },

    getAllDevices: function (req, res) {
        Device.find()
            .then(devices => res.status(200).json(devices))
            .catch(err => res.status(500).send('error : ' + err));
    },

    updateDevice: function (req, res) {
        Device.findOne({ _id: req.params.idDevice })
            .then((device) => {
                if (!device) return res.status(404).send('Device not found');

                Device.updateOne({ _id: device._id }, { ...req.body, _id: device._id })
                    .then(() => {
                        res.status(200).json({ message: "L'équipement a été modifié avec succès !" })
                    })
                    .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(400).send(error));
    },

    addDeviceFromFile: async function (req, res) {
        const url = req.protocol + "://" + req.get("host");
        const filePath = path.join('uploads', req.file.filename);

        try {
            const excelData = excelToJson({
                sourceFile: filePath,
                sheets: [{
                    name: 'devices',
                    header: { rows: 1 },
                    columnToKey: {
                        A: 'reference',
                        B: 'description',
                        C: 'vendor',
                        D: 'serialNumber',
                        E: 'startDate',
                        F: 'endDate',
                        G: 'client'
                    }
                }]
            });

            const devices = excelData.devices;

            // Iterate through each device and upsert
            for (const device of devices) {
                Client.findOne({ nom: device.client })
                    .then(async (client) => {
                        device.client = client._id
                        await Device.updateOne(
                            { serialNumber: device.serialNumber },               // Filter
                            { $set: device },                // Update
                            { upsert: true }               // Insert if not found
                        );

                    })

            }

            res.status(201).json({ message: 'Les devices ont été ajoutés/modifiés avec succès' });
        } catch (error) {
            console.error(error);
            res.status(400).send({ error });
        } finally {
            fs.unlinkSync(filePath); // Delete uploaded file
        }

    },

    exportAllDevices: async function (req, res) {
        try {
            const devices = await Device.find().populate('client'); // populate client to get nom

            const workbook = new excelJS.Workbook();
            const worksheet = workbook.addWorksheet('devices');

            worksheet.columns = [
                { header: 'Reference', key: 'reference', width: 30 },
                { header: 'Description', key: 'description', width: 30 },
                { header: 'Vendor', key: 'vendor', width: 30 },
                { header: 'S/N', key: 'serialNumber', width: 30 },
                { header: 'SDate(mm/dd/yyyy)', key: 'startDate', width: 20 },
                { header: 'EDate(mm/dd/yyyy)', key: 'endDate', width: 20 },
                { header: 'Client', key: 'client', width: 30 },
                { header: 'Status', key: 'status', width: 20 } // New column
            ];

            const flattenedData = devices.map(device => {
                const now = new Date();
                const end = new Date(device.endDate);
                const sixMonthsFromNow = new Date();
                sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

                let status = '';
                if (end < now) {
                    status = 'Expired';
                } else if (end <= sixMonthsFromNow) {
                    status = 'Soon to expire';
                } else {
                    status = 'Valid';
                }

                return {
                    reference: device.reference,
                    description: device.description,
                    vendor: device.vendor,
                    serialNumber: device.serialNumber,
                    startDate: device.startDate ? device.startDate.toLocaleDateString() : '',
                    endDate: device.endDate ? device.endDate.toLocaleDateString() : '',
                    client: device.client?.nom || '',
                    status: status
                };
            });

            worksheet.addRows(flattenedData);

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=devices.xlsx'
            );

            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.log(error);
            res.status(500).send('Error generating Excel file');
        }
    },
    exportAllDevicesByClient: async function (req, res) {
        try {
            const devices = await Device.find({ client: req.params.idClient }).populate('client');

            const workbook = new excelJS.Workbook();
            const worksheet = workbook.addWorksheet('devices');

            worksheet.columns = [
                { header: 'Reference', key: 'reference', width: 30 },
                { header: 'Description', key: 'description', width: 30 },
                { header: 'Vendor', key: 'vendor', width: 30 },
                { header: 'S/N', key: 'serialNumber', width: 30 },
                { header: 'SDate(mm/dd/yyyy)', key: 'startDate', width: 20 },
                { header: 'EDate(mm/dd/yyyy)', key: 'endDate', width: 20 },
                { header: 'Client', key: 'client', width: 30 },
                { header: 'Status', key: 'status', width: 20 }
            ];

            const flattenedData = devices.map(device => {
                const now = new Date();
                const end = device.endDate ? new Date(device.endDate) : null;
                const sixMonthsFromNow = new Date();
                sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

                let status = '';
                if (!end) {
                    status = 'Unknown';
                } else if (end < now) {
                    status = 'Expired';
                } else if (end <= sixMonthsFromNow) {
                    status = 'Soon to expire';
                } else {
                    status = 'Valid';
                }

                return {
                    reference: device.reference,
                    description: device.description,
                    vendor: device.vendor,
                    serialNumber: device.serialNumber,
                    startDate: device.startDate ? device.startDate.toLocaleDateString() : '',
                    endDate: device.endDate ? device.endDate.toLocaleDateString() : '',
                    client: device.client?.nom || '',
                    status: status
                };
            });

            worksheet.addRows(flattenedData);

            // Color cells based on status
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // skip header
                const statusCell = row.getCell('status');
                switch (statusCell.value) {
                    case 'Expired':
                        statusCell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFFCDD2' } // red
                        };
                        break;
                    case 'Soon to expire':
                        statusCell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFFF9C4' } // orange
                        };
                        break;
                    case 'Valid':
                        statusCell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFC8E6C9' } // green
                        };
                        break;
                    default:
                        statusCell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFB0B0B0' } // gray
                        };
                }
            });

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=devices.xlsx'
            );

            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.log(error);
            res.status(500).send('Error generating Excel file');
        }
    }

};
