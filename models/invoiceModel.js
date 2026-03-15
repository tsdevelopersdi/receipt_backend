import { Sequelize } from "sequelize";
import DB from "../config/Database.js";

const { DataTypes } = Sequelize;

const invoice = DB.define(
    "invoice",
    {
        nama_invoice: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
        id_user: {
            type: DataTypes.INTEGER,
            defaultValue: null,
        },
        tanggal_upload: {
            type: DataTypes.DATE,
            defaultValue: null,
        },
        total_harga: {
            type: DataTypes.INTEGER,
            defaultValue: null
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        keterangan: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        opsi: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        dept: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        acc_direksi: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        acc_supervisor: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        acc_finance: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        acc_kasir: {
            type: DataTypes.STRING,
            defaultValue: null
        },
    },
    {
        freezeTableName: true,
        paranoid: true,
    }
);

export default invoice;
