// Backend/utils/wati.js
const axios = require('axios');

/**
 * Helper to build headers for WATI requests.
 */
function getHeaders() {
  if (!process.env.WATI_API_TOKEN) {
    throw new Error('WATI_API_TOKEN not set in env');
  }

  return {
    Authorization: process.env.WATI_API_TOKEN,
    'Content-Type': 'application/json'
  };
}

/**
 * Send a simple session/text message via WATI.
 * @param {string} to - recipient number with country code, e.g. +919975672796
 * @param {string} message - text body
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
async function sendWatiText(to, message) {
  try {
    const url = `${process.env.WATI_BASE_URL}/api/v1/sendSessionMessage/${encodeURIComponent(to)}`;
    const payload = { messageText: message };

    const res = await axios.post(url, payload, { headers: getHeaders(), timeout: 10000 });
    return { success: true, data: res.data };
  } catch (err) {
    console.error('WATI sendWatiText error:', err.response?.data || err.message);
    return { success: false, error: err.response?.data || err.message };
  }
}

/**
 * Send a template message via WATI.
 * @param {string} to - recipient number e.g. +919975672796
 * @param {string} templateName - exact template name in WATI, e.g. "welcome_wati_v1"
 * @param {Array<{name:string,value:string}>} params - parameters array, empty array if none
 * @returns {Promise<{success:boolean,data?:any,error?:any}>}
 */
async function sendWatiTemplate(to, templateName, params = []) {
  try {
    if (!templateName) throw new Error('templateName is required');

    // validate params shape (basic)
    if (!Array.isArray(params)) params = [];

    const url = `${process.env.WATI_BASE_URL}/api/v1/sendTemplateMessage?whatsappNumber=${encodeURIComponent(to)}`;
    const body = {
      template_name: templateName,
      broadcast_name: 'qanda_broadcast', // you can change this
      parameters: params
    };

    const res = await axios.post(url, body, { headers: getHeaders(), timeout: 10000 });
    return { success: true, data: res.data };
  } catch (err) {
    console.error('WATI sendWatiTemplate error:', err.response?.data || err.message);
    return { success: false, error: err.response?.data || err.message };
  }
}

/**
 * Convenience: build numbered params from array of values (for templates using {{1}},{{2}}).
 * Example: buildNumberedParams(['Vicky','5 PM']) => [{name:'1', value:'Vicky'}, {name:'2', value:'5 PM'}]
 */
function buildNumberedParams(values = []) {
  return values.map((v, i) => ({ name: String(i + 1), value: String(v) }));
}

/**
 * Convenience: build named params from object. Example:
 * buildNamedParams({name: 'Vicky', time: '5 PM'}) => [{name:'name', value:'Vicky'}, {name:'time', value:'5 PM'}]
 */
function buildNamedParams(obj = {}) {
  return Object.keys(obj).map(k => ({ name: k, value: String(obj[k]) }));
}

module.exports = {
  sendWatiText,
  sendWatiTemplate,
  buildNumberedParams,
  buildNamedParams
};
