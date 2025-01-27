const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const uploadImage = require("../../utils/image/uploadImage");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const { loadImage, createCanvas } = require("canvas");
const { count } = require("console");

const createEvent = async (req, res) => {
  try {
    const { name, description, attendees, organisationId } = req.body;

    const event = await prisma.event.create({
      data: {
        name,
        description,
        attendees,
        organisationId,
      },
    });

    res.status(200).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

function convertToJSON(value) {
  // If the value is already an object, return it
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  // If the value is a string, try parsing it as JSON
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.warn("Invalid JSON string:", value);
    }
  }

  // Return the original value if it cannot be converted
  return value;
}

const addCertificateTemplate = async (req, res) => {
  try {
    const { eventId } = req.body;

    var fields = req.body.fields;

    if (!req.file) {
      console.log("req.file was not found, file could not be uploaded");
      return next(new ApiError(400, "No file uploaded"));
    }

    fields = convertToJSON(fields);

    //handle template image
    const image = await uploadImage(req.file.path);
    var certificate;

    //create certificate
    if (image) {
      certificate = await prisma.certificate.create({
        data: {
          fields,
          eventId,
          template: image.url,
        },
      });
    }

    //adding certificate to event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    await prisma.event.update({
      where: { id: eventId },
      data: {
        certificates: {
          connect: { id: certificate.id },
        },
      },
    });

    res.status(200).json({
      message: "Certificate template added successfully",
      certificate: certificate,
      event: event,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCertificate = async (req, res) => {
  try {
    const { eventId, batchSize } = req.body;

    // Validate the event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Fetch attendees in batches if batchSize is provided
    if (batchSize) {
      var attendees = await prisma.event.findUnique({
        where: { id: eventId },
      });

      attendees = attendees.attendees;

      if (!attendees.length) {
        return res.status(404).json({
          error: "No attendees found for the event",
        });
      }

      const generatedCertificates = [];

      let count = 0;

      // Generate certificates for each attendee
      for (const attendee of attendees) {
        if (count >= batchSize) {
          break;
        }
        const { fieldValues, certificateId } = attendee;

        // console.log(fieldValues, certificateId, attendee);
        try {
          if (certificateId) {
            const certificateImageSrc = await generateCertificate(
              certificateId,
              fieldValues,
              eventId,
              attendee
              // email,
              // false
            ); // Change `false` to `true` if you want to email certificates
            generatedCertificates.push({ attendee, certificateImageSrc });
          } else {
            generatedCertificates.push({
              attendee,
              error: "Certificate not found",
            });
          }
        } catch (error) {
          console.error(
            `Failed to generate certificate for attendee ID: ${attendee}`,
            error.message
          );
          generatedCertificates.push({ attendee, error: error.message });
        }
        count++;
      }

      // Return generated certificates or errors
      return res.status(200).json({
        message: "Certificates generated successfully for the batch",
        data: generatedCertificates,
      });
    }

    return res
      .status(400)
      .json({ error: "Batch size is required for batch processing" });
  } catch (error) {
    console.error("Error in getCertificate:", error.message);
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
};

const generateCertificate = async (
  certificateId,
  fieldValues,
  eventId,
  attendee
) => {
  try {
    // Fetch the certificate template
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
    });

    if (!certificate || !certificate.template) {
      throw new Error("Certificate template or URL not found");
    }

    const { template, fields } = certificate;

    if (!fields || !Array.isArray(fields)) {
      throw new Error("Invalid or missing fields in certificate template");
    }

    //remove attendee from attendees array from event schema
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    // Remove the attendee with the specific `id` from the array
    const updatedAttendees = event.attendees.filter((attendeeVal) => {
      return (
        attendeeVal?.fieldValues?.email &&
        attendeeVal.fieldValues.email !== attendee?.fieldValues?.email
      );
    });

    // Update the `attendees` field in the database
    await prisma.event.update({
      where: { id: eventId },
      data: {
        attendees: updatedAttendees,
      },
    });

    if (!certificateId || !eventId || !fieldValues || !fieldValues.email) {
      throw new Error("Missing required data for creating issuedCertificate");
    }

    console.log("Certificate ID:", certificateId);
    console.log("Event ID:", eventId);
    console.log("Field Values:", fieldValues);
    console.log("Certificate Fields:", fields);

    //add the attendee to the issuedcertificates schema
    const issuedCertificate = await prisma.issuedCertificates.create({
      data: {
        certificateId,
        eventId,
        email: fieldValues.email || "unknown-email",
        fieldValues: fieldValues,
        fields,
      },
    });

    //push issued certificate to issuedCertificates issuedCertificates[] in event schema
    await prisma.event.update({
      where: { id: eventId },
      data: {
        issuedCertificates: {
          connect: { id: issuedCertificate.id },
        },
      },
    });

    // Load the template image
    const templateImage = await loadImage(template);
    const { width, height } = templateImage;

    // Create a canvas
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");

    // Draw the template image on the canvas
    context.drawImage(templateImage, 0, 0, width, height);

    // Iterate over the fields and populate text
    for (const field of fields) {
      const {
        fieldName,
        x,
        y,
        font = "Arial",
        fontSize = 20,
        fontColor = "#000000",
      } = field;

      const value = fieldValues[fieldName];

      if (!value) {
        console.warn(`Missing value for field: ${fieldName}`);
        continue;
      }

      context.font = `${fontSize}px ${font}`;
      context.fillStyle = fontColor;
      context.textAlign = "center";
      context.fillText(value, x, y);
    }

    // Generate a QR code containing the certificate link
    const qrCodeData = `${
      process.env.DOMAIN || "testDomain"
    }/verify/certificate?id=${issuedCertificate.id}`;

    const qrCodeBuffer = await QRCode.toBuffer(qrCodeData, {
      width: 150,
      margin: 1,
    });

    // Draw the QR code on the canvas (bottom-right corner)
    const qrX = width - 170; // Adjust placement based on canvas dimensions
    const qrY = height - 170;

    const qrCodeImage = await loadImage(qrCodeBuffer);
    context.drawImage(qrCodeImage, qrX, qrY, 150, 150);

    // Generate the final image buffer
    const buffer = canvas.toBuffer("image/png");

    //saving image locally only for testing should resolve this
    const outputPath = path.resolve(__dirname, `certificate-${Date.now()}.png`);
    fs.writeFileSync(outputPath, buffer);

    // Convert the buffer to a Base64-encoded image source
    const base64Image = buffer.toString("base64");
    const imageSrc = `data:image/png;base64,${base64Image}`;

    await prisma.issuedCertificates.update({
      where: { id: issuedCertificate.id },
      data: { imageSrc },
    });

    return imageSrc;
  } catch (error) {
    console.error("Error generating certificate:", error);
    throw error;
  }
};

const addAttendee = async (req, res) => {
  try {
    const { eventId, attendees } = req.body;

    if (Array.isArray(attendees) && attendees.length > 0) {
      // Only one update call to add all attendees
      await prisma.event.update({
        where: { id: eventId },
        data: {
          attendees: {
            push: attendees, // Push all attendees at once
          },
        },
      });
    } else {
      // Add a single attendee
      await prisma.event.update({
        where: { id: eventId },
        data: {
          attendees: {
            push: [attendees], // Ensure it's wrapped in an array
          },
        },
      });
    }
    res.status(200).json({ message: "Attendees added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getEvent = async (req, res) => {
  try {
    const { id } = req.body;
    console.log("Received event ID:", id); // Log to debug
    const event = await prisma.event.findUnique({
      where: { id },
      include: { certificates: true, issuedCertificates: true },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCertificateTest = async (req, res) => {
  try {
    const { id } = req.body;
    const certificate = await prisma.certificate.findUnique({ where: { id } });

    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    res.json(certificate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const dummyCertificate = async (req, res) => {
  let fields;

  try {
    // Extract and parse fields from form-data
    if (typeof req.body.fields === "string") {
      fields = JSON.parse(req.body.fields); // Parse the stringified JSON
    } else {
      fields = req.body.fields; // Handle it as JSON (unlikely for form-data but safe)
    }

    // Validate fields is an array
    if (!Array.isArray(fields)) {
      return res
        .status(400)
        .json({ error: "Invalid input. 'fields' must be an array." });
    }
  } catch (error) {
    return res.status(400).json({ error: "Invalid JSON format for 'fields'." });
  }

  const fieldValues = {};

  // Populate dummy values for each field
  fields.forEach((key) => {
    fieldValues[key.fieldName] = "Dummy Value";
  });

  const image = req.file;

  if (!image) {
    return res.status(400).json({ error: "Template image is required." });
  }

  try {
    // Load the template image
    const templateImage = await loadImage(image.path);
    const { width, height } = templateImage;

    // Create a canvas
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");

    // Draw the template image on the canvas
    context.drawImage(templateImage, 0, 0, width, height);

    // Iterate over the fields and populate text
    for (const field of fields) {
      const {
        fieldName,
        x,
        y,
        font = "Arial",
        fontSize = 20,
        fontColor = "#000000",
      } = field;

      const value = fieldValues[fieldName];

      if (!value) {
        console.warn(`Missing value for field: ${fieldName}`);
        continue;
      }

      context.font = `${fontSize}px ${font}`;
      context.fillStyle = fontColor;
      context.textAlign = "center";
      context.fillText(value, x, y);
    }

    // Generate a QR code containing the certificate link
    const qrCodeData = `${process.env.DOMAIN || "testDomain"}/test`;

    const qrCodeBuffer = await QRCode.toBuffer(qrCodeData, {
      width: 150,
      margin: 1,
    });

    // Draw the QR code on the canvas (bottom-right corner)
    const qrX = width - 170; // Adjust placement based on canvas dimensions
    const qrY = height - 170;

    const qrCodeImage = await loadImage(qrCodeBuffer);
    context.drawImage(qrCodeImage, qrX, qrY, 150, 150);

    // Generate the final image buffer
    const buffer = canvas.toBuffer("image/png");

    // Save the image locally (for testing)
    const outputPath = path.resolve(__dirname, `certificate-${Date.now()}.png`);
    fs.writeFileSync(outputPath, buffer);

    // Convert the buffer to a Base64-encoded image source
    const base64Image = buffer.toString("base64");
    const imageSrc = `data:image/png;base64,${base64Image}`;

    // Return the generated image source
    return res.status(200).json({ imageSrc });
  } catch (error) {
    console.error("Error generating the certificate:", error);
    return res
      .status(500)
      .json({ error: "Failed to generate the certificate." });
  }
};

module.exports = {
  addCertificateTemplate,
  getCertificate,
  createEvent,
  addAttendee,
  getEvent,
  getCertificateTest,
  dummyCertificate,
};
