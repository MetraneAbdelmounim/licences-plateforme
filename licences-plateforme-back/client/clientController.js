const config = require('../config/config')
const Client = require('./client')
const Member = require('../member/member')
let path = require('path')
var excelToJson = require('convert-excel-to-json');
const mongoose = require('mongoose')
let fs = require('fs')
const excelJS = require('exceljs');
const ping = require('ping')

module.exports = {
    addClient: function (req, res) {
        const id = new mongoose.Types.ObjectId()
        const client = new Client({
            _id: id,
            ...req.body
        });
        client.save(client)
            .then(async () => {
                    
                res.status(201).json({ message: 'Un nouveau Client a été ajouté avec succés !' })
            })
            .catch(error => {
                res.status(400).send({ error })
            }
            );
    },

    getAllClients: function (req, res) {
        Client.find().then(async Clients => {
            if (Clients) {
                res.status(200).json(Clients);
            }
        }).catch(err => {

            if (err) res.status(500).send('error : ' + err);
        })
    },
    getClientByID: function (req, res) {
        Client.findOne({ _id: req.params.idClient })
            .then((Client) => {
                res.status(200).json(Client);
            })
            .catch(error => res.status(500).send(error));
    },
    deleteClient: function (req, res) {
        Client.findOne({ _id: req.params.idClient })
            .then((client) => {
                Client.deleteOne({ _id: client._id }).then(
                    () => {

                        res.status(200).json({
                            message: "Le Client a été supprimé avec succés"
                        });
                    }
                ).catch(
                    (error) => {
                        res.status(400).json({
                            error: error
                        });
                    }
                );
            })
            .catch(error => {
                console.log(error);

                res.status(500).send(error)
            });
    },
    updateClient: function (req, res) {


        Client.findOne({ _id: req.params.idClient })
            .then((client) => {

                Client.updateOne({ _id: client._id }, { ...req.body, _id: client._id })
                    .then(() => {

                        res.status(200).json({ message: "Le client a été modifé avec succés !" })
                    })
                    .catch(error => {

                        res.status(400).json({ error })
                    });
            })
            .catch(error => {

                res.status(400).send(error)
            });

    },

}