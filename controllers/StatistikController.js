import Presensi from "../models/PresensiModel.js";
import Kelas from "../models/KelasModel.js";
import { Op } from "sequelize";
import MuridKelas from "../models/MuridKelasModel.js";

export const statKelas = async (req, res) => {
  const { startDate, endDate, kelaId } = req.body;
  var dates = [];
  var count = [];
  try {
    const response = await Presensi.findAll({
      where: {
        tanggal: {
          [Op.between]: [startDate, endDate],
        },
        kelaId: kelaId,
      },
    });

    response.forEach((element, index) => {
      if (!dates.includes(element.tanggal)) {
        dates.push(element.tanggal);
      }
    });

    await Promise.all(
      dates.map(async (date) => {
        const total = await Presensi.count({
          where: {
            tanggal: date,
            kelaId: kelaId,
          },
        });
        const hadir = await Presensi.count({
          where: {
            tanggal: date,
            status: "hadir",
            kelaId: kelaId,
          },
        });
        const izin = await Presensi.count({
          where: {
            tanggal: date,
            status: "izin",
            kelaId: kelaId,
          },
        });
        const alfa = await Presensi.count({
          where: {
            tanggal: date,
            status: "alfa",
            kelaId: kelaId,
          },
        });
        count.push({
          date: date,
          total: total,
          hadir: hadir,
          izin: izin,
          alfa: alfa,
        });
      })
    );

    res.json(count);
  } catch (error) {
    res.json(error);
  }
};

export const statPerson = async (req, res) => {
  const { startDate, endDate, kelaId, siswaId } = req.body;
  var dates = [];
  var count = [];
  try {
    const total = await Presensi.count({
      where: {
        tanggal: {
          [Op.between]: [startDate, endDate],
        },
        kelaId: kelaId,
        siswaId: siswaId,
      },
    });
    const hadir = await Presensi.count({
      where: {
        tanggal: {
          [Op.between]: [startDate, endDate],
        },
        status: "hadir",
        kelaId: kelaId,
        siswaId: siswaId,
      },
    });
    const izin = await Presensi.count({
      where: {
        tanggal: {
          [Op.between]: [startDate, endDate],
        },
        status: "izin",
        kelaId: kelaId,
        siswaId: siswaId,
      },
    });
    const alfa = await Presensi.count({
      where: {
        tanggal: {
          [Op.between]: [startDate, endDate],
        },
        status: "alfa",
        kelaId: kelaId,
        siswaId: siswaId,
      },
    });
    count.push({
      //   date: date,
      total: total,
      hadir: hadir,
      izin: izin,
      alfa: alfa,
    });

    res.json(count);
  } catch (error) {
    res.json(error);
  }
};

export const percentageKelas = async (req, res) => {
  const { startDate, endDate, kelaId } = req.body;
  var dates = [];
  var count = [];
  try {
    const total = await Presensi.count({
      where: {
        tanggal: {
          [Op.between]: [startDate, endDate],
        },
        kelaId: kelaId,
      },
    });
    const hadir = await Presensi.count({
      where: {
        tanggal: {
          [Op.between]: [startDate, endDate],
        },
        status: "hadir",
        kelaId: kelaId,
      },
    });
    const izin = await Presensi.count({
      where: {
        tanggal: {
          [Op.between]: [startDate, endDate],
        },
        status: "izin",
        kelaId: kelaId,
      },
    });
    const alfa = await Presensi.count({
      where: {
        tanggal: {
          [Op.between]: [startDate, endDate],
        },
        status: "alfa",
        kelaId: kelaId,
      },
    });
    count.push({
      //   date: date,
      total: total,
      hadir: hadir,
      izin: izin,
      alfa: alfa,
    });

    res.json(count);
  } catch (error) {
    res.json(error);
  }
};

export const kelasIndividu = async (req, res) => {
  // res.json(req.params.id);
  try {
    const response = await Kelas.findAll({
      include: {
        model: MuridKelas,
        where: {
          siswaId: req.params.id,
          status: "aktif",
        },
      },
    });

    res.json(response);
  } catch (error) {
    res.json(error);
  }
};

export const statPersonKelas = async (req, res) => {
  // res.json(req.params.kelasnya);
  const { startDate, endDate } = req.body;
  try {
    const response = await Presensi.findAll({
      where: {
        siswaId: req.params.id,
        kelaId: req.params.kelasnya,
        tanggal: {
          [Op.between]: [startDate, endDate],
        },
      },
    });
    res.json(response);
  } catch (error) {
    res.json(error);
  }
};
