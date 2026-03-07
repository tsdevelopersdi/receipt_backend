import { Sequelize } from "sequelize";
import DB from "../config/Database.js";

const { DataTypes } = Sequelize;

const APIUsageIndividual = DB.define(
    "api_usage_individual",
    {
        id_user: {
            type: DataTypes.INTEGER,
            defaultValue: null,
        },
        // id_api: {
        //     type: DataTypes.INTEGER,
        //     defaultValue: null,
        // },
        id_api_group: {
            type: DataTypes.INTEGER,
            defaultValue: null,
        },
        api_usage: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        freezeTableName: true,
        paranoid: true,
    },
);

export default APIUsageIndividual;
