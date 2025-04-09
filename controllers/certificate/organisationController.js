const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getOrganisations = async (req, res) => {
  try {
    const organisations = await prisma.organisation.findMany();
    res.json(organisations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getOrganisationById = async (req, res) => {
  try {
    const { id } = req.body;
    const organisation = await prisma.organisation.findUnique({
      where: { id },
    });
    if (!organisation) {
      return res.status(404).json({ error: "Organisation not found" });
    }
    res.json(organisation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createOrganisation = async (req, res) => {
  try {
    const { name, description } = req.body;
    const organisation = await prisma.organisation.create({
      data: { name, description },
    });
    res.json(organisation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getOrganisationEvents = async (req, res) => {
  try {
    const { id } = req.body;
    const events = await prisma.event.findMany({
      where: { organisationId: id },
    });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createOrganisationEvent = async (req, res) => {
  try {
    const { name, description, organisationId, attendees, formId } = req.body;
    // console.log(Object.keys(prisma));

    const event = await prisma.event.create({
      data: { name, description, organisationId, attendees, formId },
    });
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getOrganisations,
  getOrganisationById,
  createOrganisation,
  getOrganisationEvents,
  createOrganisationEvent,
};
