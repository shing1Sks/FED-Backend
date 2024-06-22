const asyncHandler = require('express-async-handler');
const { PrismaClient } = require('@prisma/client');
const express = require('express');
const expressAsyncHandler = require('express-async-handler');

const prisma = new PrismaClient();


const editDetails = expressAsyncHandler ( async (req, res, next) => {

})

module.exports = { editDetails };
