const {
    getSettingsAppsModel,
    updateSettingsAppsModel,
} = require("../models/settingsModel");

const getSettingsApps = async (req, res) => {
    try {
        const settings = await getSettingsAppsModel(req, res);

        return res.success(200, settings);
    } catch (error) {
        console.error(error);
        return res.error(500, "Failed to get Settings Apps");
    }
};

const updateSettingsApps = async (req, res) => {
    const id = req.body.id;
    const data = req.body;

    try {
        const settings = await updateSettingsAppsModel(id, data);

        return res.success(200, settings);
    } catch (error) {
        console.error(error);
        return res.error(500, "Failed to update Settings Apps");
    }
};

module.exports = { getSettingsApps, updateSettingsApps };
