import { Sequelize } from "sequelize";
import DB from "../config/Database.js";

const { DataTypes } = Sequelize;

const ProjectModel = DB.define(
  "projects",
  {
    // name: {
    //   type: DataTypes.STRING,
    //   defaultValue: null,
    // },
    project_name: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    client: { 
      type: DataTypes.STRING,
      defaultValue: null,
    },
    start_date: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    budget: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    // project: {
    //   type: DataTypes.STRING,
    //   defaultValue: null,
    // },
    // draft_name: {
    //   type: DataTypes.STRING,
    //   defaultValue: null,
    // },
    // status: {
    //   type: DataTypes.STRING,
    //   defaultValue: null,
    // },
    // department: {
    //   type: DataTypes.STRING,
    //   defaultValue: null,
    // },
  },
  {
    freezeTableName: true,
    paranoid: true,
  }
);

export default ProjectModel;
