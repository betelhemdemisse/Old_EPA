const { Zone, Subcity,Region ,Woreda} = require("../models");
const { v4: uuidv4 } = require("uuid");

exports.createZone = async (req, res) => {
  try {
    const existingZone = await Zone.findOne({
      where: {
        zone_name: req.body.zone_name,
        region_id: req.body.region_id,
      },
    });
    if (existingZone) {
      return res.status(400).json({
        error: "A zone with this zone_name already exists in the specified region",
      });
    }

    const zoneId = uuidv4();
    console.log(zoneId);

    const zone = await Zone.create({
      zone_id: zoneId,
      ...req.body,
    });

    console.log(zone);
    res.status(201).json(zone);
  } catch (error) {
    console.error("Error creating zone:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.getAllZones = async (req, res) => {
  try {
    const zones = await Zone.findAll({
      include: [{ model: Region, as: "region" }]
    });
    res.status(200).json(zones);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.getZoneById = async (req, res) => {
  try {
    const { id } = req.params;
    const zone = await Zone.findAll({
      where: { zone_id: id },
       include: [{ model: Region, as: "region" }]
    });
    if (!zone) {
      return res.status(404).json({ error: "Zone not found" });
    }

    res.status(200).json(zone);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getZonesByRegionId = async (req, res) => {
  try {
    const { id } = req.params;

    const zones = await Zone.findAll({
      where: { region_id: id },
       include: [{ model: Region, as: "region" },
        { model: Woreda, as: "woreda" }
       ]
    });

    if (zones.length === 0) {
      const subcities = await Subcity.findAll({
        where: { city_id: id },
      });


      return res.status(200).json(zones);
    }

    res.status(200).json(zones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.updateZone = async (req, res) => {
  try {
    const { zone_name } = req.body;
    const { id } = req.params;
    const { regionId } = req.body;
    const zone = await Zone.findByPk(id);
    if (!zone) return res.status(404).json({ error: "Zone not found" });
    zone.zone_name = zone_name;
    zone.region_id = regionId;
    await zone.save();
    res.status(200).json(zone);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteZone = async (req, res) => {
  try {
    const { id } = req.params;
    const zone = await Zone.findByPk(id);
    if (!zone) return res.status(404).json({ error: "Zone not found" });

    await zone.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};