const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { validationResult } = require('express-validator');

// Get all events
const getEvent = async (req, res) => {
  try {
    const events = await prisma.Event.findMany();
    res.status(200).json({
      success: true,
      message: 'All events fetched successfully',
      events,
    });
  } catch (error) {
    console.error('Error while getting events:', error);
    res.status(500).json({
      success: false,
      message: 'Error while getting events',
      error,
    });
  }
};

// Add a new event
const addEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, date, image, description, registration } = req.body;

    // Validation
    // if (res.locals.userData.access !== '0') {
    //   return res.status(403).json({ message: 'User does not have admin access' });
    // }

    const newEvent = await prisma.Event.create({
      data: {
        title,
        date,
        image,
        description,
        registration,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: newEvent,
    });
  } catch (error) {
    console.error('Error in creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error in creating event',
      error,
    });
  }
};

// Edit an event
const editEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const eventId = req.params.id;
    const { title, date, image, description, registration } = req.body;

    // Validation
    if (res.locals.userData.access !== '0') {
      return res.status(403).json({ message: 'User does not have admin access' });
    }

    const existingEvent = await prisma.Event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!existingEvent) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const updatedEvent = await prisma.Event.update({
      where: {
        id: eventId,
      },
      data: {
        title,
        date,
        image,
        description,
        registration,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Error in updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error in updating event',
      error,
    });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Validation
    if (res.locals.userData.access !== '0') {
      return res.status(403).json({ message: 'User does not have admin access' });
    }

    await prisma.Event.delete({
      where: {
        id: eventId,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Error in deleting event',
      error,
    });
  }
};

module.exports = {
  addEvent,
  editEvent,
  deleteEvent,
  getEvent,
};
