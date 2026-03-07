import { Sequelize } from "sequelize";
import DB from "../config/Database.js";

const { DataTypes } = Sequelize;

const APIUsageGroup = DB.define(
    "api_usage_group",
    {
        group_name: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
        // id_api: {
        //     type: DataTypes.INTEGER,
        //     defaultValue: null,
        // },
        // id_api_group: {
        //     type: DataTypes.INTEGER,
        //     defaultValue: null,
        // },
        api_usage_total: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        api_limit: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        freezeTableName: true,
        paranoid: true,
    },
);

export default APIUsageGroup;
