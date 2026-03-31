// import Users from "../models/UserModel.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import { Op } from "sequelize";
import DB from "../config/Database.js";
import Siswa from "../models/SiswaModel.js";
import Users from "../models/UserModel.js";
import Presensi from "../models/PresensiModel.js";
import sld_draft from "../models/DraftModel.js";
import ProjectModel from "../models/ProjectModel.js";
import sld_draft_name from "../models/sld_draft.js";
import Pricelist from "../models/Pricelist.js";
import BoxModel from "../models/BoxModel.js";
import selectedBox from "../models/selectedBox.js";
import invoice from "../models/invoiceModel.js";
import transaction from "../models/transactionModel.js";
import APIUsageGroup from "../models/api_ussage_group.js";
import APIUsageIndividual from "../models/api_ussage_individual.js";
import {
  sendManagerNotification,
  sendAdminStatusNotification,
  sendNextApproverNotification
} from "../utils/EmailService.js";

// >>> CREATE NEW SISWA
export const createSiswa = async (req, res) => {
  const {
    nama_lengkap,
    tempat_lahir,
    tanggal_lahir,
    gender,
    nama_ayah,
    nama_ibu,
    alamat,
    kelompok,
    desa,
    daerah,
    no_telp,
  } = req.body;
  if (req.alldata.role === "admin") {
    try {
      const file = req.files.file;
      const fileSize = file.data.length;
      const ext = path.extname(file.name);
      const fileName = req.body.nama_lengkap + ext;
      const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
      const allowedType = [".png", ".jpg", ".jpeg"];
      if (!allowedType.includes(ext.toLowerCase()))
        return res.status(422).json({ msg: "Invalid Images" });
      if (fileSize > 5000000)
        return res.status(422).json({ msg: "Image must be less than 5 MB" });

      file.mv(`./public/images/${fileName}`, async (err) => {
        if (err) return res.status(500).json({ msg: err.message });
        try {
          await Siswa.create({
            nama_lengkap: nama_lengkap,
            tanggal_lahir: tanggal_lahir,
            tempat_lahir: tempat_lahir,
            nama_ayah: nama_ayah,
            nama_ibu: nama_ibu,
            gender: gender,
            kelompok: kelompok,
            desa: desa,
            daerah: daerah,
            alamat: alamat,
            no_telp: no_telp,
            foto: fileName,
          });
          res.status(201).json({ msg: "Siswa Created Successfuly" });
        } catch (error) {
          console.log(error.message);
        }
      });
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    return res.status(403).json({ msg: "Akses terlarang" });
  }
};

// >>> GET ALL SISWA
export const getSiswa = async (req, res) => {
  try {
    const response = await Siswa.findAll({
      //   attributes: ["id", "nama_lengkap", "kelompok", "gender"],
    });
    res.json(response);
  } catch (error) {
    res.status(500).json(error);
  }
};

// >>> GET SPECIFIC SISWA
export const getSpecificSiswa = async (req, res) => {
  try {
    const response = await Siswa.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!response) {
      return res.status(404).json({ msg: "No Data Found" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json(error);
  }
};

// >>> UPDATE SPECIFIC SISWA
export const updateSiswa = async (req, res) => {
  if (req.alldata.role !== "admin") {
    return res.status(403).json({ msg: "Forbidden Bro" });
  }
  const {
    nama_lengkap,
    tanggal_lahir,
    tempat_lahir,
    gender,
    nama_ayah,
    nama_ibu,
    alamat,
    kelompok,
    desa,
    daerah,
    no_telp,
  } = req.body;
  try {
    const response = await Siswa.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!response) {
      return res.status(404).json({ msg: "No Data Found" });
    }
    let fileName = "";
    if (req.files === null) {
      fileName = response.foto;
    } else {
      const file = req.files.file;
      const fileSize = file.data.length;
      const ext = path.extname(file.name);
      const fileName = req.body.nama_lengkap + ext;
      const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
      const allowedType = [".png", ".jpg", ".jpeg"];
      if (!allowedType.includes(ext.toLowerCase()))
        return res.status(422).json({ msg: "Invalid Images" });
      if (fileSize > 5000000)
        return res.status(422).json({ msg: "Image must be less than 5 MB" });

      try {
        const filepath = `./public/images/${response.foto}`;
        fs.unlinkSync(filepath);
      } catch (error) {
        console.log(error);
      }

      file.mv(`./public/images/${fileName}`, async (err) => {
        await Siswa.update(
          {
            foto: fileName,
          },
          {
            where: {
              id: req.params.id,
            },
          },
        );
        if (err) return res.status(500).json({ msg: err.message });
      });
    }
    try {
      await Siswa.update(
        {
          nama_lengkap: nama_lengkap,
          tanggal_lahir: tanggal_lahir,
          tempat_lahir: tempat_lahir,
          gender: gender,
          nama_ayah: nama_ayah,
          nama_ibu: nama_ibu,
          alamat: alamat,
          kelompok: kelompok,
          desa: desa,
          daerah: daerah,
          no_telp: no_telp,
        },
        {
          where: {
            id: req.params.id,
          },
        },
      );
      res.status(200).json({ msg: "Product Updated Successfuly" });
    } catch (error) {
      console.log(error.message);
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// >>> HAPUS SISWA
export const deleteSiswa = async (req, res) => {
  try {
    const response = await Siswa.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!response) {
      return res.status(404).json({ msg: "No Data Found" });
    }
    await Siswa.destroy({
      where: {
        id: req.params.id,
      },
    });
    try {
      const filepath = `./public/images/${response.foto}`;
      fs.unlinkSync(filepath);
    } catch (error) {
      console.log(error);
    }
    res.status(200).json({ msg: "Siswa deleted successfuly" });
  } catch (error) { }
};

// >>> ATTENDANCE API
export const attendance = async (req, res) => {
  try {
    console.log("=== ATTENDANCE REQUEST ===");
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    // Check if photo exists
    if (!req.files || !req.files.photo) {
      return res.status(400).json({
        success: false,
        message: "No photo uploaded",
      });
    }

    const file = req.files.photo; // 'photo' matches the field name from Flutter
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    const { name } = req.body;

    // Get Indonesia time (UTC+7)
    const now = new Date();
    const indonesiaTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const humanReadableTimestamp = indonesiaTime
      .toISOString()
      .slice(0, 19)
      .replace("T", " ")
      .replace(/:/g, "-");
    const fileName = `${name} ${humanReadableTimestamp}.jpg`;
    const allowedType = [".png", ".jpg", ".jpeg"];

    // Validate file type
    if (!allowedType.includes(ext.toLowerCase())) {
      return res.status(422).json({
        success: false,
        message: "Invalid image format. Only PNG, JPG, JPEG allowed",
      });
    }

    // Validate file size (5MB)
    if (fileSize > 5000000) {
      return res.status(422).json({
        success: false,
        message: "Image must be less than 5 MB",
      });
    }

    // Create directory if it doesn't exist
    const uploadDir = process.env.ATTENDANCE_UPLOAD_DIR;
    console.log("Upload directory:", uploadDir);

    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log("Directory created:", uploadDir);
      }
    } catch (mkdirErr) {
      console.log("Error creating directory:", mkdirErr);
      return res.status(500).json({
        success: false,
        message: `Failed to create upload directory: ${mkdirErr.message}`,
      });
    }

    // Normalize path for both Windows and Linux
    const filePath = path.join(uploadDir, fileName);
    console.log("Full file path:", filePath);

    // Save the file
    file.mv(filePath, async (err) => {
      if (err) {
        console.log("Error saving file:", err);
        console.log("Attempted path:", filePath);
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      try {
        // Get form data
        const { email, name, latitude, longitude, accuracy } = req.body;

        // Use Indonesia time (UTC+7) for database timestamp
        const now = new Date();
        const indonesiaTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
        const formattedTimestamp = indonesiaTime
          .toISOString()
          .slice(0, 19)
          .replace("T", " ")
          .replace(/:/g, "-");
        const photoFileName = `${name} ${formattedTimestamp}.jpg`;

        console.log("Photo saved:", photoFileName);
        console.log("Attendance data:", {
          email,
          name,
          formattedTimestamp,
          latitude,
          longitude,
          accuracy,
        });

        // Here you can save to database
        await Siswa.create({
          email,
          name,
          timestamp: formattedTimestamp,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          accuracy: parseFloat(accuracy),
          photo: photoFileName,
        });

        return res.status(200).json({
          success: true,
          message: "Attendance registered successfully!",
          data: {
            email,
            name,
            timestamp: formattedTimestamp,
            location: { latitude, longitude, accuracy },
            photo: photoFileName,
          },
        });
      } catch (error) {
        console.log("Error processing attendance:", error);
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    });
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// >>> GET ATTENDANCE (WITH QUERY PARAMS)
export const getSpecificAttendance = async (req, res) => {
  console.log("=== ALL DATA ===", req.alldata);
  try {
    const { role, status, startDate, endDate } = req.body;
    const thePerson = await Users.findOne({
      where: {
        email: req.alldata.email,
      },
    });
    const statusnya = thePerson.status;
    console.log("=== STATUSNYA ===", statusnya);
    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    // Date range filtering
    if (startDate && endDate) {
      where.timestamp = {
        [Op.between]: [startDate + " 00:00:00", endDate + " 23:59:59"],
      };
    } else if (startDate) {
      where.timestamp = { [Op.gte]: startDate + " 00:00:00" };
    } else if (endDate) {
      where.timestamp = { [Op.lte]: endDate + " 23:59:59" };
    }

    var miniWhere = undefined;
    if (statusnya === "SITE") {
      miniWhere = {
        status: "SITE",
      };
    }

    if (req.alldata.role === "supervisor") {
      console.log("=== DEPARTMENT ===", thePerson.department);
      miniWhere = {
        department: thePerson.department,
      };
    }

    const response = await Presensi.findAll({
      attributes: [
        "id",
        "id_user",
        "timestamp",
        "name",
        "email",
        "status",
        "photo",
        "caption",
        "latitude",
        "longitude",
        "accuracy",
        "job_type",
      ],
      limit: 500,
      order: [["id", "DESC"]],
      where,
      include: [
        {
          model: Users,
          where: miniWhere,
          attributes: [
            "id",
            "nik",
            "name",
            "email",
            "role",
            "status",
            "department",
          ],
        },
      ],
    });

    // if (response.length === 0) {
    //   return res.status(404).json({ msg: "No Data Found" });
    // }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json(error);
  }
};

// >>> GET ATTENDANCE (WITH QUERY PARAMS) BY EMAIL
export const getSpecificAttendanceByEmail = async (req, res) => {
  console.log("=== ALL DATA ===", req.alldata);
  console.log("=== USER email 2 ===", req.params.id);
  try {
    const { role, status, startDate, endDate } = req.body;
    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    // Date range filtering
    if (startDate && endDate) {
      where.timestamp = {
        [Op.between]: [startDate + " 00:00:00", endDate + " 23:59:59"],
      };
    } else if (startDate) {
      where.timestamp = { [Op.gte]: startDate + " 00:00:00" };
    } else if (endDate) {
      where.timestamp = { [Op.lte]: endDate + " 23:59:59" };
    }

    var miniWhere = undefined;
    if (req.alldata.role === "admin") {
      miniWhere = {
        status: "SITE",
      };
    }

    if (req.alldata.role === "supervisor") {
      console.log("=== DEPARTMENT ===", req.alldata.department);
      miniWhere = {
        department: req.alldata.department,
      };
    }

    const response = await Presensi.findAll({
      attributes: [
        "id",
        "id_user",
        "timestamp",
        "name",
        "email",
        "status",
        "photo",
        "caption",
        "latitude",
        "longitude",
        "accuracy",
      ],
      limit: 500,
      order: [["id", "DESC"]],
      where,
      include: [
        {
          model: Users,
          where: {
            email: req.params.id,
          },
          attributes: ["id", "nik", "name", "email", "role", "status"],
        },
      ],
    });

    // if (response.length === 0) {
    //   return res.status(404).json({ msg: "No Data Found" });
    // }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json(error);
  }
};

// >>> SAVE SLD DRAFT
export const saveDraft = async (req, res) => {
  console.log("=== SAVE DRAFT ===", req.body);
  const total_item = req.body.items.length;
  console.log("=== TOTAL ITEM ===", total_item);

  try {
    await sld_draft_name.create({
      project_id: req.body.projectId,
      project_name: req.body.projectName,
      draft_name: req.body.documentTitle,
    });

    for (let i = 0; i < total_item; i++) {
      const item = req.body.items[i];
      console.log(`=== ITEM ${i} ===`, item);

      const response = await sld_draft.create({
        qty: item.quantity,
        unit: item.unit,
        description: item.description,
        type: item.type,
        brand_merk: item.brand_merk,
        project: req.body.projectName,
        draft_name: req.body.documentTitle,
      });

      console.log(`=== ITEM ${i} SAVED ===`, response); // add this to confirm saves
    }

    res.status(200).json("oke");
  } catch (error) {
    console.error("=== ERROR ===", error); // add this so you can see the real error
    res.status(500).json({ message: error.message, error });
  }
};

// >>> UPDATE SLD DRAFT
export const updateDraft = async (req, res) => {
  const { draftId, projectId, documentTitle, items } = req.body;
  const total_item = items.length;
  console.log("=== TOTAL ITEM ===", total_item);

  // Find the master draft record
  let selectedDraftName;
  if (draftId) {
    selectedDraftName = await sld_draft_name.findByPk(draftId);
  } else {
    // Fallback search by name and project
    const queryDraft = { draft_name: documentTitle };
    if (projectId && !isNaN(projectId)) {
      queryDraft.project_id = projectId;
    }
    selectedDraftName = await sld_draft_name.findOne({ where: queryDraft });
  }

  if (!selectedDraftName) {
    return res.status(404).json({ message: "Draft record not found" });
  }

  // Find the items (they are linked by draft_name)
  // TODO: In future, link items by draft_id for better integrity
  const selectedDraft = await sld_draft.findAll({
    where: {
      draft_name: selectedDraftName.draft_name,
    },
  });

  console.log("total item in DB before update:", selectedDraft.length);
  if (total_item !== selectedDraft.length) {
    res
      .status(400)
      .json({ message: "Jumlah item tidak sesuai dengan database" });
    return;
  }
  try {
    for (let i = 0; i < selectedDraft.length; i++) {
      const item = req.body.items[i];
      await sld_draft.update(
        {
          price: item.price,
          notes: item.notes,
        },
        {
          where: {
            id: selectedDraft[i].id,
          },
        },
      );
    }
    await sld_draft_name.update(
      {
        is_priced: "yes",
      },
      {
        where: {
          id: selectedDraftName.id,
        },
      },
    );
    res.status(200).json({ message: "Draft updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message, error });
  }
};

// >>> GET ALL DRAFT NAME
export const list_draft = async (req, res) => {
  try {
    const { project_id } = req.query;
    const where = project_id ? { project_id } : {};

    const response = await sld_draft_name.findAll({
      where,
      include: [
        {
          model: ProjectModel,
          attributes: ["id", "project_name", "client", "status"],
        },
      ],
    });
    res.json(response);
  } catch (error) {
    res.status(500).json(error);
  }
};

// >>> GET ALL DRAFT ITEMS BY DRAFT NAME
export const getDraftItems = async (req, res) => {
  const the_id = req.params.id;
  try {
    const response = await sld_draft_name.findOne({
      where: {
        id: the_id,
      },
    });
    console.log("=== RESPONSE DRAFT NAME ===", response.draft_name);
    const data = await sld_draft.findAll({
      where: {
        draft_name: response.draft_name,
      },
      attributes: ["id", "qty", "unit", "description", "type", "brand_merk", "price", "disc", "jumlah", "notes"],
    });
    res.json({ data });
  } catch (error) {
    res.status(500).json(error);
  }
};

// >>> GET ALL PROJECT
export const list_project = async (req, res) => {
  try {
    const response = await ProjectModel.findAll({
      // attributes: ['project'],
      // group: ['project']
    });
    res.json(response);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const projectnya = async (req, res) => {
  try {
    const response = await ProjectModel.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// >>> SAVE PROJECT
export const save_project = async (req, res) => {
  console.log("=== SAVE PROJECT ===", req.body);
  try {
    const response = await ProjectModel.create({
      project_name: req.body.name,
      client: req.body.client,
      start_date: req.body.start_date,
      budget: req.body.budget,
      status: req.body.status,
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json(error);
  }
  // res.status(200).json("oke");
};

// >>> GET ALL PRICE LIST
export const price_list = async (req, res) => {
  try {
    const response = await Pricelist.findAll({
      attributes: [
        "id",
        "qty",
        "unit",
        "deskripsi",
        "tipe",
        "merk",
        "harga_before_disc",
        "disc",
        "harga",
        "disc_",
        "created_by",
        "updated_by",
      ],
    });
    res.json(response);
  } catch (error) {
    res.status(500).json(error);
  }
};

// >>> GET ALL PRICE LIST WITH QUERY PARAMS (SEARCH, PAGINATION)
export const getAllPriceWithQuery = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || ""; // Capture search param
    const offset = (page - 1) * limit;
    // Define search condition using partial match (LIKE)
    const where = search
      ? {
        [Op.or]: [
          { deskripsi: { [Op.iLike]: `%${search}%` } }, // Note the 'i' in iLike
          { tipe: { [Op.iLike]: `%${search}%` } },
          { merk: { [Op.iLike]: `%${search}%` } },
        ],
      }
      : {};
    const result = await Pricelist.findAndCountAll({
      where, // Apply search filter
      limit,
      offset,
      attributes: [
        "id",
        "qty",
        "unit",
        "deskripsi",
        "tipe",
        "merk",
        "harga_before_disc",
        "disc",
        "harga",
        "disc_",
        "created_by",
        "updated_by",
      ],
    });
    res.json({
      currentPage: page,
      perPage: limit,
      totalItems: result.count,
      totalPages: Math.ceil(result.count / limit),
      products: result.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const UpdateProject = async (req, res) => {
  console.log("=== PROJECT ID ===", req.params.id);
  console.log("=== UPDATE PROJECT ===", req.body);
  // return res.status(200).json("oke");
  const projectId = req.params.id;
  // const { project_name, client, start_date, budget, status } = req.body;

  try {
    const response = await ProjectModel.update(
      {
        project_name: req.body.name,
        client: req.body.client,
        start_date: req.body.start_date,
        budget: req.body.budget,
        status: req.body.status,
      },
      {
        where: {
          id: projectId,
        },
      },
    );
    res.status(200).json({ message: "Project updated successfully", response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const box_list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    const where = search
      ? {
        [Op.or]: [
          { nama_panel: { [Op.iLike]: `%${search}%` } },
          { ukuran_panel: { [Op.iLike]: `%${search}%` } },
        ],
      }
      : {};

    const result = await BoxModel.findAndCountAll({
      where,
      limit,
      offset,
      attributes: [
        "id",
        "nama_panel",
        "ukuran_panel",
        "harga_panel",
        "harga_wiring",
      ],
    });

    res.json({
      currentPage: page,
      perPage: limit,
      totalItems: result.count,
      totalPages: Math.ceil(result.count / limit),
      boxes: result.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const saveBox = async (req, res) => {
  console.log("=== SAVE BOX ===", req.body);
  const boxData = req.body.boxes[0];
  try {
    const existing = await selectedBox.findOne({
      where: { draft_id: req.body.draft_id }
    });

    let response2;
    if (existing) {
      response2 = await existing.update({
        nama_panel: boxData.nama_panel,
        ukuran_panel: boxData.ukuran_panel,
        harga_panel: boxData.harga_panel,
        harga_wiring: boxData.harga_wiring,
        total_harga: boxData.total_harga,
      });
    } else {
      response2 = await selectedBox.create({
        draft_id: req.body.draft_id,
        nama_panel: boxData.nama_panel,
        ukuran_panel: boxData.ukuran_panel,
        harga_panel: boxData.harga_panel,
        harga_wiring: boxData.harga_wiring,
        total_harga: boxData.total_harga,
      });
    }

    res
      .status(200)
      .json({ message: "Box recommendation updated successfully", response2 });
  } catch (error) {
    console.error("Error updating draft with box ID:", error);
    res
      .status(500)
      .json({ message: "Failed to update draft with box ID", error });
  }
};

export const buatPenawaran = async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await ProjectModel.findOne({
      where: { id: projectId },
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const sldDrafts = await sld_draft_name.findAll({
      where: { project_id: project.id },
      order: [["id", "ASC"]],
    });

    const items = [];
    let no = 1;
    let totalHarga = 0;

    for (const sld of sldDrafts) {
      const draftLines = await sld_draft.findAll({
        where: { draft_name: sld.draft_name },
        order: [["id", "ASC"]],
      });

      for (const row of draftLines) {
        const qty = Math.max(0, parseInt(row.qty, 10) || 0);
        const hargaAwalRp = parseInt(String(row.price).replace(/\D/g, ""), 10) || 0;
        const disc = row.disc != null ? String(row.disc) : "0";
        const hargaSetelahDiscRp = parseInt(String(row.harga_rp || row.jumlah).replace(/\D/g, ""), 10) || hargaAwalRp;
        const rowTotal = hargaSetelahDiscRp * qty;
        totalHarga += rowTotal;

        items.push({
          no: no++,
          qty,
          satuan: row.unit || "-",
          nama_panel: row.description || row.type || "-",
          tipe_ukuran: row.type || "-",
          harga_awal_rp: hargaAwalRp,
          disc,
          harga_setelah_disc_rp: hargaSetelahDiscRp,
          row_total: rowTotal,
        });
      }

      const box = await selectedBox.findOne({
        where: { draft_id: sld.id },
      });
      if (box) {
        const qty = 1;
        const hargaAwalRp = box.total_harga ?? (box.harga_panel || 0) + (box.harga_wiring || 0);
        const hargaSetelahDiscRp = box.total_harga ?? hargaAwalRp;
        const rowTotal = hargaSetelahDiscRp * qty;
        totalHarga += rowTotal;

        items.push({
          no: no++,
          qty,
          satuan: "Unit",
          nama_panel: box.nama_panel || "Panel",
          tipe_ukuran: box.ukuran_panel || "-",
          harga_awal_rp: hargaAwalRp,
          disc: "0",
          harga_setelah_disc_rp: hargaSetelahDiscRp,
          row_total: rowTotal,
        });
      }
    }
    const response = {
      project: {
        id: project.id,
        project_name: project.project_name,
        client: project.client,
      },
      items,
      total_harga: totalHarga,
    };
    console.log("buatPenawaran response:", response);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error buatPenawaran:", error);
    res.status(500).json({ message: "Failed to build penawaran", error: error.message });
  }
};

export const list_invoice = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const offset = (page - 1) * limit;

    let where = {};

    // 1. Status Filter
    if (status) {
      if (status === "technician_pending") {
        where.status = "on_review";
        where.opsi = "technician";
      } else if (status === "sales_pending") {
        where.status = "on_review";
        where.opsi = "sales";
      } else if (status === "completed") {
        where.status = { [Op.or]: ["completed", "closed"] };
      } else {
        where.status = status;
      }
    }

    // 2. Search Filter (Partial match on nama_invoice)
    if (search) {
      where.nama_invoice = { [Op.iLike]: `%${search}%` };
    }

    // 3. User Filter (If not admin/manager/supervisor/finance/kasir, show only their own)
    const allApproverRoles = ["admin", "manager", "supervisor", "finance", "kasir"];
    if (req.alldata && !allApproverRoles.includes(req.alldata.role)) {
      where.id_user = req.alldata.userId;
    }

    const { count, rows } = await invoice.findAndCountAll({
      where,
      include: [
        {
          model: Users,
          attributes: ["id", "name", "email", "role"],
        },
      ],
      limit,
      offset,
      order: [["id", "DESC"]],
    });

    res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      invoices: rows,
    });
  } catch (error) {
    console.error("Error in list_invoice:", error);
    res.status(500).json({ message: "Failed to fetch invoices", error: error.message });
  }
};

export const invoiceDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const invoiceData = await invoice.findByPk(id, {
      include: [transaction, Users],
    });
    if (!invoiceData) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json(invoiceData);
  } catch (error) {
    console.error("Error invoiceDetail:", error);
    res.status(500).json({ message: "Failed to get invoice detail", error: error.message });
  }
};

export const getInvoiceSummary = async (req, res) => {
  try {
    const total = await invoice.count();
    const rejected = await invoice.count({ where: { status: "rejected" } });
    const completed = await invoice.count({ where: { status: { [Op.or]: ["completed", "closed"] } } });

    // Technician Pending: opsi technician AND not completed/rejected/closed
    const technician_pending = await invoice.count({
      where: {
        opsi: "technician",
        status: "on_review"
      }
    });

    // Sales Pending: opsi sales AND not completed/rejected/closed
    const sales_pending = await invoice.count({
      where: {
        opsi: "sales",
        status: "on_review"
      }
    });

    res.status(200).json({
      total,
      rejected,
      completed,
      technician_pending,
      sales_pending,
      // fallback for old UI compatibility
      on_review: technician_pending + sales_pending,
      on_forward: 0,
      accepted: completed
    });
  } catch (error) {
    console.error("Error getInvoiceSummary:", error);
    res.status(500).json({ message: "Failed to get invoice summary", error: error.message });
  }
};

export const updateInvoiceTransactions = async (req, res) => {
  const { id, transactions } = req.body;
  try {
    const existingInvoice = await invoice.findByPk(id);
    if (!existingInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Clear old transactions
    await transaction.destroy({ where: { invoice_id: id } });

    let totalHarga = 0;
    const newTransactions = [];

    // Save new transactions
    if (transactions && transactions.length > 0) {
      for (const t of transactions) {
        const jumlah = parseFloat(t.jumlah) || 0;
        totalHarga += jumlah;

        newTransactions.push({
          invoice_id: id,
          tanggal: t.tanggal || null,
          merchant: t.merchant || "",
          jumlah: jumlah,
          // Optional: id_user: req.alldata?.id
        });
      }
      await transaction.bulkCreate(newTransactions);
    }

    // Update invoice total harga
    await existingInvoice.update({ total_harga: totalHarga });

    res.status(200).json({ message: "Invoice updated successfully" });
  } catch (error) {
    console.error("Error updating invoice transactions:", error);
    res.status(500).json({ message: "Failed to update invoice transactions", error: error.message });
  }
};

export const updateInvoiceStatus = async (req, res) => {
  const { id, action } = req.body; // Action can be 'approve' or 'close'
  const userRole = req.alldata.role;
  const userDept = req.alldata.department;
  const userName = req.alldata.name;

  try {
    const existingInvoice = await invoice.findByPk(id, {
      include: [Users]
    });
    if (!existingInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const { opsi, acc_supervisor, acc_finance, acc_direksi, acc_kasir, dept: invoiceDept } = existingInvoice;

    // --- TECHNICIAN FLOW ---
    if (opsi === "technician") {
      if (action === "approve") {
        // Step 1: Supervisor (matching dept)
        if (!acc_supervisor && !acc_finance && !acc_direksi) {
          if (userRole !== "supervisor" || userDept !== invoiceDept) {
            return res.status(403).json({ message: "Only Supervisor from this department can approve first." });
          }
          await existingInvoice.update({ acc_supervisor: userName });
        }
        // Step 2: Finance (after supervisor)
        else if (acc_supervisor && !acc_finance && !acc_direksi) {
          if (userRole !== "finance") {
            return res.status(403).json({ message: "Only Finance can approve after Supervisor." });
          }
          await existingInvoice.update({ acc_finance: userName });
        }
        // Step 3: Manager (after finance)
        else if (acc_supervisor && acc_finance && !acc_direksi) {
          if (userRole !== "manager") {
            return res.status(403).json({ message: "Only Manager can approve after Finance." });
          }
          await existingInvoice.update({ acc_direksi: userName, status: "completed" });
        }
        else {
          return res.status(400).json({ message: "Approval complete or out of sequence." });
        }
      } else if (action === "close") {
        // Step 4: Finance (Close after Manager)
        if (acc_direksi && existingInvoice.status === "completed") {
          if (userRole !== "finance") {
            return res.status(403).json({ message: "Only Finance can close the invoice." });
          }
          await existingInvoice.update({ status: "closed" });
        } else {
          return res.status(400).json({ message: "Cannot close invoice yet. Manager approval required." });
        }
      } else if (action === "reject") {
        // Anyone in approval chain can reject at any point UNLESS already completed/closed
        if (existingInvoice.status === "completed" || existingInvoice.status === "closed") {
          return res.status(400).json({ message: "Cannot reject a completed or closed invoice." });
        }
        await existingInvoice.update({ status: "rejected" });
      }
    }

    // --- SALES FLOW ---
    else if (opsi === "sales") {
      if (action === "approve") {
        // Step 1: Manager
        if (!acc_direksi && !acc_kasir && !acc_finance) {
          if (userRole !== "manager") {
            return res.status(403).json({ message: "Only Manager can approve first." });
          }
          await existingInvoice.update({ acc_direksi: userName });
        }
        // Step 2: Kasir (after manager)
        else if (acc_direksi && !acc_kasir && !acc_finance) {
          if (userRole !== "kasir") {
            return res.status(403).json({ message: "Only Kasir can approve after Manager." });
          }
          await existingInvoice.update({ acc_kasir: userName });
        }
        // Step 3: Finance (after kasir)
        else if (acc_direksi && acc_kasir && !acc_finance) {
          if (userRole !== "finance") {
            return res.status(403).json({ message: "Only Finance can approve after Kasir." });
          }
          await existingInvoice.update({ acc_finance: userName, status: "completed" });
        }
        else {
          return res.status(400).json({ message: "Approval complete or out of sequence." });
        }
      } else if (action === "close") {
        // Step 4: Finance (Close after Finance approval)
        if (acc_finance && existingInvoice.status === "completed") {
          if (userRole !== "finance") {
            return res.status(403).json({ message: "Only Finance can close the invoice." });
          }
          await existingInvoice.update({ status: "closed" });
        } else {
          return res.status(400).json({ message: "Cannot close invoice yet. Finance approval required." });
        }
      } else if (action === "reject") {
        // Anyone in approval chain can reject at any point UNLESS already completed/closed
        if (existingInvoice.status === "completed" || existingInvoice.status === "closed") {
          return res.status(400).json({ message: "Cannot reject a completed or closed invoice." });
        }
        await existingInvoice.update({ status: "rejected" });
      }
    }

    // Handle case where opsi is neither technician nor sales (should not happen in normal flow)
    else if (action === "reject") {
      // For invoices without a valid opsi, allow rejection
      if (existingInvoice.status === "completed" || existingInvoice.status === "closed") {
        return res.status(400).json({ message: "Cannot reject a completed or closed invoice." });
      }
      await existingInvoice.update({ status: "rejected" });
    }
    else {
      return res.status(422).json({ message: "Invalid 'opsi' or 'action' value." });
    }

    // --- SEND EMAIL NOTIFICATIONS ---
    const { user: uploader, total_harga } = existingInvoice;
    const uploaderName = uploader?.name || "User";

    // Reload the invoice to get the fresh status after the updates above
    await existingInvoice.reload();
    const freshInvoice = existingInvoice;

    if (action === "approve") {
      if (opsi === "technician") {
        if (!freshInvoice.acc_finance) {
          // After Supervisor approval, notify Finance
          sendNextApproverNotification("finance", null, uploaderName, id, total_harga);
        } else if (!freshInvoice.acc_direksi) {
          // After Finance approval, notify Manager
          sendNextApproverNotification("manager", null, uploaderName, id, total_harga);
        } else if (freshInvoice.status === "completed") {
          // After Manager approval, notify Finance to close
          sendNextApproverNotification("finance", null, uploaderName, id, total_harga);
        }
      } else if (opsi === "sales") {
        if (!freshInvoice.acc_kasir) {
          // After Manager approval, notify Kasir
          sendNextApproverNotification("kasir", null, uploaderName, id, total_harga);
        } else if (!freshInvoice.acc_finance) {
          // After Kasir approval, notify Finance
          sendNextApproverNotification("finance", null, uploaderName, id, total_harga);
        } else if (freshInvoice.status === "completed") {
          // After Finance approval, notify Finance to close
          sendNextApproverNotification("finance", null, uploaderName, id, total_harga);
        }
      }
    } else if (action === "reject") {
        // Notify uploader or admin on rejection if needed
        // For now, let's keep it simple as the user didn't specify rejection notifications
    }

    res.status(200).json({ message: `Invoice action '${action}' successful.` });
  } catch (error) {
    console.error("Error updating invoice status:", error);
    res.status(500).json({ message: "Failed to update invoice status", error: error.message });
  }
};

export const getAPIUsage = async (req, res) => {
  try {
    const userId = req.alldata.userId;
    // Find or create individual usage record
    let [individualUsage, created] = await APIUsageIndividual.findOrCreate({
      where: { id_user: userId },
      defaults: {
        id_user: userId,
        api_usage: 0,
        id_api_group: null
      },
      include: [{ model: APIUsageGroup }]
    });

    // If it was just created, we need to re-fetch to get the include correctly if needed
    if (created) {
      individualUsage = await APIUsageIndividual.findOne({
        where: { id_user: userId },
        include: [{ model: APIUsageGroup }]
      });
    }

    if (!individualUsage || !individualUsage.api_usage_group) {
      return res.status(200).json({
        hasGroup: false,
        message: "You don't belong to any group yet"
      });
    }

    const group = individualUsage.api_usage_group;
    res.status(200).json({
      hasGroup: true,
      groupName: group.group_name,
      usage: group.api_usage_total,
      limit: group.api_limit
    });
  } catch (error) {
    console.error("Error getAPIUsage:", error);
    res.status(500).json({ message: "Failed to get API usage", error: error.message });
  }
};

// >>> INVOICE SUMMARY (ADVANCED — date range, flow, status, dept)
export const getInvoiceSummaryAdvanced = async (req, res) => {
  try {
    const {
      dateFrom, dateTo,
      flow, status, dept,
      search,
      page: pageStr, limit: limitStr,
      all // if truthy, return only KPI counts with no pagination
    } = req.query;

    const page   = parseInt(pageStr, 10) || 1;
    const limit  = all ? 99999 : (parseInt(limitStr, 10) || 10);
    const offset = (page - 1) * limit;

    // ── Build WHERE clause ──────────────────────────────────────────
    const where = {};

    // Role filter: regular users only see their own
    const approverRoles = ["admin", "manager", "supervisor", "finance", "kasir"];
    if (req.alldata && !approverRoles.includes(req.alldata.role)) {
      where.id_user = req.alldata.userId;
    }

    // Date range on tanggal_upload
    if (dateFrom && dateTo) {
      where.tanggal_upload = { [Op.between]: [new Date(dateFrom + "T00:00:00"), new Date(dateTo + "T23:59:59")] };
    } else if (dateFrom) {
      where.tanggal_upload = { [Op.gte]: new Date(dateFrom + "T00:00:00") };
    } else if (dateTo) {
      where.tanggal_upload = { [Op.lte]: new Date(dateTo + "T23:59:59") };
    }

    // Flow filter (opsi)
    if (flow) where.opsi = flow;

    // Status filter
    if (status) {
      if (status === "completed") {
        where.status = { [Op.or]: ["completed", "closed"] };
      } else {
        where.status = status;
      }
    }

    // Dept filter
    if (dept) where.dept = { [Op.iLike]: `%${dept}%` };

    // Search on keterangan
    if (search) {
      where.keterangan = { [Op.iLike]: `%${search}%` };
    }

    // ── KPI counts (always computed from the same WHERE) ────────────
    const [total, pending, completed, closed, rejected, totalAmountRaw] = await Promise.all([
      invoice.count({ where }),
      invoice.count({ where: { ...where, status: "on_review" } }),
      invoice.count({ where: { ...where, status: "completed" } }),
      invoice.count({ where: { ...where, status: "closed" } }),
      invoice.count({ where: { ...where, status: "rejected" } }),
      invoice.sum("total_harga", { where }),
    ]);

    // ── Trend Analysis (Group by Day) ───────────────────────────────
    // Grouping by Date using Sequelize literal for SQLite/Postgres/MySQL compatibility
    // Note: Since this is likely Postgres/MySQL based on iLike usage above
    const trends = await invoice.findAll({
      where,
      attributes: [
        [DB.fn('DATE', DB.col('tanggal_upload')), 'day'],
        [DB.fn('SUM', DB.col('total_harga')), 'amount'],
        [DB.fn('COUNT', DB.col('id')), 'count'],
      ],
      group: [DB.fn('DATE', DB.col('tanggal_upload'))],
      order: [[DB.fn('DATE', DB.col('tanggal_upload')), 'ASC']],
      raw: true
    });

    // ── Monthly Trend Analysis ─────────────────────────────────────
    const monthlyTrends = await invoice.findAll({
      where,
      attributes: [
        [DB.fn('TO_CHAR', DB.col('tanggal_upload'), 'YYYY-MM'), 'month'],
        [DB.fn('SUM', DB.col('total_harga')), 'amount'],
        [DB.fn('COUNT', DB.col('id')), 'count'],
      ],
      group: [DB.fn('TO_CHAR', DB.col('tanggal_upload'), 'YYYY-MM')],
      order: [[DB.fn('TO_CHAR', DB.col('tanggal_upload'), 'YYYY-MM'), 'ASC']],
      raw: true
    });

    // ── Status Distribution ─────────────────────────────────────────
    const statusDistribution = await invoice.findAll({
      where,
      attributes: [
        'status',
        [DB.fn('COUNT', DB.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true
    });

    // ── Paginated rows ──────────────────────────────────────────────
    const { count, rows } = await invoice.findAndCountAll({
      where,
      include: [{ model: Users, attributes: ["id", "name", "email", "role"] }],
      limit,
      offset,
      order: [["id", "DESC"]],
    });

    res.status(200).json({
      // KPI
      total,
      pending,
      completed,
      closed,
      rejected,
      totalAmount: totalAmountRaw || 0,
      // Analysis
      trends: trends.map(t => ({ day: t.day, amount: parseInt(t.amount, 10), count: parseInt(t.count, 10) })),
      monthlyTrends: monthlyTrends.map(t => ({ month: t.month, amount: parseInt(t.amount, 10), count: parseInt(t.count, 10) })),
      statusDistribution: statusDistribution.map(s => ({ status: s.status, count: parseInt(s.count, 10) })),
      // Table
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      invoices: rows,
    });
  } catch (error) {
    console.error("Error getInvoiceSummaryAdvanced:", error);
    res.status(500).json({ message: "Failed to get invoice summary", error: error.message });
  }
};

export const incrementAPIUsage = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("[API Usage] Incrementing for userId:", userId);

    // 1. Find the individual usage record with its group
    const individualUsage = await APIUsageIndividual.findOne({
      where: { id_user: userId },
      include: [{ model: APIUsageGroup }]
    });

    if (!individualUsage) {
      return res.status(404).json({ message: "API Usage record not found for this user" });
    }

    const group = individualUsage.api_usage_group;
    if (!group) {
      return res.status(403).json({ message: "You don't belong to any API group yet" });
    }

    // 🔥 PRIORITIZED LIMIT CHECK
    if (group.api_usage_total >= group.api_limit) {
      console.warn(`[API Usage] Limit reached for group: ${group.group_name} (${group.api_usage_total}/${group.api_limit})`);
      return res.status(403).json({
        message: "API usage limit reached for your group. Processing aborted.",
        usage: group.api_usage_total,
        limit: group.api_limit
      });
    }

    const groupId = group.id;

    // 2. Perform increments
    await DB.transaction(async (t) => {
      // Increment Individual
      await individualUsage.increment('api_usage', { by: 1, transaction: t });

      // Increment Group if exists
      if (groupId) {
        await APIUsageGroup.increment('api_usage_total', {
          by: 1,
          where: { id: groupId },
          transaction: t
        });
      }
    });

    return res.status(200).json({ message: "Usage incremented successfully" });
  } catch (error) {
    console.error("Error incrementing API usage:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
