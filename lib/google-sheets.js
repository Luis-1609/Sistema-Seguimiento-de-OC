import { google } from 'googleapis';

/**
 * Cliente de Google Sheets con autenticación OAuth2.
 * 
 * Usa un refresh_token almacenado en variables de entorno
 * para obtener access_tokens automáticamente sin intervención del usuario.
 * 
 * Estructura del Sheet (pestaña DATA):
 * A = OC | B = Proveedor | C = Línea de OC | D = Monto
 * E = Estado | F = Descripcion | G = Fecha vencimiento | H = Comprador
 */

// Crear cliente OAuth2
function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Faltan credenciales de Google OAuth2. Verifica GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y GOOGLE_REFRESH_TOKEN en tus variables de entorno.'
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return oauth2Client;
}

// Obtener instancia de la API de Sheets
function getSheetsAPI() {
  const auth = getOAuth2Client();
  return google.sheets({ version: 'v4', auth });
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'DATA';
const CONFIG_SHEET_NAME = process.env.GOOGLE_CONFIG_SHEET_NAME || 'CONFIG';

/**
 * Lee todas las filas del Sheet (excluyendo el header).
 * Retorna un array de objetos con las columnas mapeadas según los headers.
 */
export async function getRows() {
  const sheets = getSheetsAPI();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:H`,
  });

  const rows = response.data.values || [];

  if (rows.length <= 1) return []; // Solo header o vacío

  const headers = rows[0]; // ['OC', 'Proveedor', 'Línea de OC', ...]
  const dataRows = rows.slice(1);

  return dataRows.map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      // Normalizar header a snake_case para uso interno
      const key = header
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // quitar acentos
        .replace(/[°º]/g, '')           // quitar ° de N°
        .replace(/\s+/g, '_')           // espacios → underscore
        .trim();
      obj[key] = row[index] || '';
    });
    return obj;
  });
}

/**
 * Lee los usuarios de la pestaña CONFIG del Sheet.
 * Columnas: A=Codigo Comprador | B=Nombre comprador | C=Correo comprador | D=Rol
 */
export async function getUsuarios() {
  const sheets = getSheetsAPI();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${CONFIG_SHEET_NAME}!A:D`,
  });

  const rows = response.data.values || [];

  if (rows.length <= 1) return []; // Solo header o vacío

  const headers = rows[0];
  const dataRows = rows.slice(1);

  return dataRows
    .map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        const key = header
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[°º]/g, '')
          .replace(/\s+/g, '_')
          .trim();
        obj[key] = row[index] || '';
      });
      return obj;
    })
    .filter((u) => u.codigo_comprador); // Filtrar filas vacías
}

/**
 * Agrega una nueva fila al final del Sheet.
 */
export async function appendRow(data) {
  const sheets = getSheetsAPI();

  const values = [
    [
      data.oc,
      data.proveedor,
      data.id || '',
      data.monto,
      data.estado,
      data.descripcion,
      data.fecha_vencimiento || '',
      data.comprador || '',
    ],
  ];

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:H`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values },
  });

  return response.data;
}

/**
 * Actualiza una fila existente buscando por OC + Línea de OC (para identificar la fila única).
 * @param {number} rowIndex - Índice de la fila en el Sheet (1-indexed, incluyendo header)
 * @param {object} data - Los datos a actualizar
 */
export async function updateRowByIndex(rowIndex, data) {
  const sheets = getSheetsAPI();

  const values = [
    [
      data.oc,
      data.proveedor,
      data.id || '',
      data.monto,
      data.estado,
      data.descripcion,
      data.fecha_vencimiento || '',
      data.comprador || '',
    ],
  ];

  const updateResponse = await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A${rowIndex}:H${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });

  return updateResponse.data;
}

/**
 * Busca la fila de una orden por OC y Línea de OC.
 * Retorna el índice de la fila (1-indexed) o -1 si no se encuentra.
 */
export async function findRowIndex(oc, lineaDeOc) {
  const sheets = getSheetsAPI();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:C`,
  });

  const rows = response.data.values || [];

  for (let i = 1; i < rows.length; i++) { // Skip header
    if (rows[i][0] === String(oc) && rows[i][2] === String(lineaDeOc)) {
      return i + 1; // 1-indexed para la API de Sheets
    }
  }

  return -1;
}

/**
 * Elimina una fila por su índice.
 */
export async function deleteRowByIndex(rowIndex) {
  const sheets = getSheetsAPI();

  // Obtener el sheetId numérico
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  });

  const sheet = spreadsheet.data.sheets.find(
    (s) => s.properties.title === SHEET_NAME
  );

  if (!sheet) {
    throw new Error(`Hoja "${SHEET_NAME}" no encontrada.`);
  }

  const sheetIdNumeric = sheet.properties.sheetId;

  // rowIndex es 1-indexed, deleteDimension usa 0-indexed
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetIdNumeric,
              dimension: 'ROWS',
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            },
          },
        },
      ],
    },
  });

  return { deleted: true };
}
