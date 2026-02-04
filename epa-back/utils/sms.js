const axios = require("axios");
const logger = require("./logger");
const { SMS } = require("../models");

const formatPhoneNumber = (phoneNumber) => {
  if (phoneNumber.startsWith("+251")) {
    return "0" + phoneNumber.slice(4); 
  }
  throw new Error("Invalid phone number format");
};

const sendSMS = async (
  phoneNumber,
  message,
  transaction = null,
  created_by = null
) => {
  const sender = process.env.JASMIN_FROM || "EPA";
  const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

  logger.info(`Sending SMS via Jasmin to ${formattedPhoneNumber}`);
  logger.info(`Sending SMS via Jasmin to 2 ${phoneNumber}`);

  try {
    const response = await axios.post(process.env.JASMIN_SERVER, null, {
      params: {
        username: process.env.JASMIN_USERNAME,
        password: process.env.JASMIN_PASSWORD,
        to: formattedPhoneNumber,
        from: sender,
        content: message,
      },
    });
    logger.info("SMS sent successfully via Jasmin");
    try {
      await SMS.create(
        {
          sender,
          recipient: formattedPhoneNumber,
          message,
          status: "sent",
          sent_at: new Date(),
          created_by: created_by,
        },
        { transaction }
      );
    } catch (dbError) {
      logger.error(`Failed to save SMS to DB: ${dbError.message}`);
    }
    return response.data;
  } catch (error) {
    const errMsg = `Failed to send SMS via Jasmin: ${error.message}`;
    logger.error(errMsg);
    try {
      await SMS.create({
        sender,
        recipient: formattedPhoneNumber,
        message,
        status: "failed",
        error: error.message,
        sent_at: new Date(),
        created_by: created_by,
      });
    } catch (dbError) {
      logger.error(`Failed to save failed SMS to DB: ${dbError.message}`);
    }
    throw new Error(errMsg);
  }
};
module.exports = {
  sendSMS,
};
