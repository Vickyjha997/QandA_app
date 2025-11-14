require("dotenv").config();
const axios = require("axios");

const token = "EAATof0hrHWkBPxWkaJwtgKCUd3QZC6hZCqqmHBrPRDJ4gXwWjm24wFIzagVy0thI9Qp1WxG8iWXTRGwpmiWUKko8JBeoEZC4tuaf3NWpQ0zhvLRZAxWRsoF1l1PEI4QgkfvKTQd1WZC3ZBWzvzOvxPQYSb1mc0tr7ayUcRxssldkWGFcZC4qOsufgdD0DNC986LdXRk5Jy4ZB3jy3OQ7TqQM6riRY47SZAHefZBrxP5ZAQ0iVqNZAAZDZD";
const phoneId = "845594758640608";
const apiUrl = "https://graph.facebook.com/v19.0";

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

sendWhatsAppMessage("919975672796");
