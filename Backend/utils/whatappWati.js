require("dotenv").config();
const axios = require("axios");


// This is What Direct Test Account API END POINT
const token = process.env.WHATSAPP_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const apiUrl = process.env.WHATSAPP_API_URL;


async function sendWhatsAppMessage(to) {
  try {
    const url = `${apiUrl}/${phoneId}/messages`;
    console.log("Final URL =>", url);

    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: "hello_world",
        language: { code: "en_US" },
      },
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const res = await axios.post(url, payload, { headers });
    console.log("Success:", res.data);

  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
  }
}

//sendWhatsAppMessage("919975672796");



/**
 * Send WATI Template Message (matches your cURL EXACTLY)
 */
// This is Wati DEMO Account API ENDPOINT

async function sendWatiTemplateMessage(to, name) {
  const url = `${process.env.WATI_BASE_URL}/api/v1/sendTemplateMessage`;

  try {
    const response = await axios.post(
      `${url}?whatsappNumber=${encodeURIComponent(to)}`,
      {
        template_name: "welcome_wati_v1",
        broadcast_name: "string",
        parameters: [
          {
            name: "name",
            value: name
          }
        ]
      },
      {
        headers: {
          accept: "*/*",
          Authorization: `${process.env.WATI_API_TOKEN}`,
          "Content-Type": "application/json"  
        }
      }
    );

    console.log("SUCCESS:", response.data);
    return response.data;

  } catch (err) {
    console.error("ERROR:", err.response?.data || err.message);
    return err;
  }
}

//sendWatiTemplateMessage("+919975672796","Vicky");

module.exports={
  sendWhatsAppMessage,
  sendWatiTemplateMessage
}





