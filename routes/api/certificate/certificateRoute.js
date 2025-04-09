const express = require("express");
const router = express.Router();
const { imageUpload } = require("../../../middleware/upload");
const {
  addCertificateTemplate,
  getCertificate,
  createEvent,
  addAttendee,
  getEvent,
  getCertificateTest,
  dummyCertificate,
  getEventByFormId,
  sendBatchMails,
  testCertificateSending,
  verifyCertificate,
  sendCertViaEmail,
  sendCertificatesAndEvents,
} = require("../../../controllers/certificate/eventCertificateController.js");
const {
  getOrganisations,
  getOrganisationById,
  createOrganisation,
  getOrganisationEvents,
  createOrganisationEvent,
} = require("../../../controllers/certificate/organisationController.js");
const { verifyToken } = require("../../../middleware/verifyToken.js");
const { checkAccess } = require("../../../middleware/access/checkAccess");

// PUBLIC ROUTES

router.post("/verifyCertificate", verifyCertificate);
router.post("/getEventByFormId", getEventByFormId);
router.get("/getEvent", getEvent);

router.use(verifyToken, checkAccess("ADMIN", "USER", "MEMBER"));

// PRIVATE ROUTES

// Test Name Position
// router.post("/testNamePosition", testNamePosition);
router.get("/getOrganisationEvents", getOrganisationEvents);
router.post("/createOrganisationEvent", createOrganisationEvent);
router.post("/addAttendee", addAttendee);
router.post(
  "/addCertificateTemplate",
  imageUpload.single("image"),
  addCertificateTemplate
);
router.post("/getCertificate", getCertificate);
//checked this route only returns the data stored in certifcate schema !
router.get("/getCertificateTest", getCertificateTest);
router.post("/dummyCertificate", imageUpload.single("image"), dummyCertificate);
router.post("/sendBatchMails", sendBatchMails);
router.post("/testCertificateSending", testCertificateSending);
//accidently created 2 paths for createEvent and createOrganisationEvent
router.post("/createEvent", createEvent);
router.post("/sendCertViaEmail", sendCertViaEmail);
router.post("/sendCertificatesAndEvents", sendCertificatesAndEvents);

module.exports = router;
