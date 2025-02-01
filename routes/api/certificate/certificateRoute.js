const express = require("express");
const router = express.Router();
const { imageUpload } = require("../../../middleware/upload");
const {
  addCertificateTemplate,
  getCertificate,
  // createEvent,
  addAttendee,
  getEvent,
  getCertificateTest,
  dummyCertificate,
  getEventByFormId,
  sendBatchMails,
  testCertificateSending,
} = require("../../../controllers/certificate/eventCertificateController.js");
const {
  getOrganisations,
  getOrganisationById,
  createOrganisation,
  getOrganisationEvents,
  createOrganisationEvent,
} = require("../../../controllers/certificate/organisationController.js");

// const {
//   saveCertificate,
//   getCertificateByEventId,
//   deleteCertificate,
// } = require("../../../controllers/certificate/certificateController");
// const { testNamePosition } = require("../../../controllers/certificate/testNameController");

// // Save or Update Certificate
// router.post("/certificate", saveCertificate);

// // Get Certificate by Event ID
// router.get("/certificate/:eventId", getCertificateByEventId);

// // Delete Certificate
// router.delete("/certificate/:eventId", deleteCertificate);

// // Test Name Position
// router.post("/testNamePosition", testNamePosition);

// Organisation Routes

//checked
router.get("/getOrganisations", getOrganisations);
//checked
router.get("/getOrganisation", getOrganisationById);
//checked
router.post("/createOrganisation", createOrganisation);
//checked
router.get("/getOrganisationEvents", getOrganisationEvents);
//checked
router.post("/createOrganisationEvent", createOrganisationEvent);
//checked
router.post("/addAttendee", addAttendee);
//checked
router.get("/getEvent", getEvent);

// Event Routes

//checked
router.post(
  "/addCertificateTemplate",
  imageUpload.single("image"),
  addCertificateTemplate
);
//checked
router.get("/getCertificate", getCertificate);
//checked this route only returns the data stored in certifcate schema !
router.get("/getCertificateTest", getCertificateTest);
//checked
router.post("/dummyCertificate", imageUpload.single("image"), dummyCertificate);
//checked
router.post("/getEventByFormId", getEventByFormId);
//checked
router.post("/sendBatchMails", sendBatchMails);
//
router.post("/testCertificateSending", testCertificateSending);
//accidently created 2 paths for createEvent and createOrganisationEvent
// router.post("/createEvent", createEvent);

module.exports = router;
