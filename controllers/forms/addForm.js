const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { ApiError } = require("../../utils/error/ApiError");
const uploadimage = require("../../utils/image/uploadImage");
const status = require("http-status");

// @description     Add regForm
// @route           POST /api/form/addForm
// @access          Admins

const addForm = async (req, res, next) => {
  try {
    const {
      _id,
      eventTitle,
      eventdescription,
      eventDate,
      eventType,
      upi,
      eventAmount,
      eventMaxReg,
      relatedEvent,
      participationType,
      maxTeamSize,
      minTeamSize,
      regDateAndTime,
      eventPriority,
      successMessage,
      isPublic,
      isRegistrationClosed,
      isEventPast,
    } = req.body;

    const info = {
      _id,
      eventTitle,
      eventdescription,
      eventDate,
      eventType,
      eventAmount,
      eventMaxReg,
      relatedEvent,
      participationType,
      maxTeamSize,
      minTeamSize,
      regDateAndTime,
      eventPriority,
      successMessage,
      isPublic,
      isRegistrationClosed,
      isEventPast,
      receiverDetails: { upi: upi, media: null },
    };

    const eventImgFile = req.files
      ? req.files?.eventImg
        ? req.files.eventImg[0]
        : null
      : null;
    const qrmediaFile = req.files
      ? req.files?.media
        ? req.files.media[0]
        : null
      : null;

    if (eventImgFile) {
      const result = await uploadimage(eventImgFile.path, "FormImages");
      info.eventImg = result ? result.secure_url : null;
    } else {
      ApiError(status.BAD_REQUEST, "Event image not found");
    }

    if (qrmediaFile) {
      const result = await uploadimage(qrmediaFile.path, "QRMediaImages");
      info.receiverDetails.media = result ? result.secure_url : null;
    } else {
      new ApiError(status.BAD_REQUEST, "QR media image not found");
    }

    const newForm = await prisma.form.create({
      data: {
        id: req.body.id,
        info: info,
        sections: JSON.parse(req.body.sections || "[]"),
      },
    });

    res.status(status.OK).json({
      success: true,
      message: "Form created successfully",
      form: newForm,
    });
  } catch (error) {
    console.error("Error in creating form:", error);
    if (error.code === "P2002") {
      return next(
        new ApiError(
          status.INTERNAL_SERVER_ERROR,
          "Duplicate form ID. Form ID must be unique",
          error
        )
      );
    }
    return next(
      new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Error in creating form",
        error
      )
    );
  }
};

module.exports = { addForm };
