import { google } from 'googleapis';

/**
 * Cliente de Google Sheets con autenticación OAuth2.
 * 
 * Usa un refresh_token almacenado en variables de entorno
 * para obtener access_tokens automáticamente sin intervención del usuario.
 */

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

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
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Ordenes';

/**
 * Lee todas las filas del Sheet (excluyendo el header).
 * Retorna un array de objetos con las columnas mapeadas.
 */
export async function getRows() {
  const sheets = getSheetsAPI();
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:J`,
  });

  const rows = response.data.values || [];
  
  if (rows.length <= 1) return []; // Solo header o vacío

  const headers = rows[0];
  const dataRows = rows.slice(1);

  return dataRows.map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      // Normalizar header a snake_case para uso interno
      const key = header
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_');
      obj[key] = row[index] || '';
    });
    return obj;
  });
}

/**
 * Agrega una nueva fila al final del Sheet.
 */
export async function appendRow(data) {
  const sheets = getSheetsAPI();

  const values = [
    [
      data.id,
      data.fecha_creacion,
      data.proveedor,
      data.descripcion,
      data.monto,
      data.estado,
      data.fecha_entrega_estimada,
      data.responsable,
      data.notas || '',
      data.fecha_actualizacion,
    ],
  ];

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:J`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values },
  });

  return response.data;
}

/**
 * Actualiza una fila existente buscándola por su ID (columna A).
 */
export async function updateRow(id, data) {
  const sheets = getSheetsAPI();

  // Primero encontrar la fila con ese ID
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:A`,
  });

  const ids = response.data.values || [];
  let rowIndex = -1;
  
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) {
      rowIndex = i + 1; // +1 porque Sheets es 1-indexed
      break;
    }
  }

  if (rowIndex === -1) {
    throw new Error(`Orden con ID "${id}" no encontrada.`);
  }

  const values = [
    [
      data.id || id,
      data.fecha_creacion,
      data.proveedor,
      data.descripcion,
      data.monto,
      data.estado,
      data.fecha_entrega_estimada,
      data.responsable,
      data.notas || '',
      data.fecha_actualizacion,
    ],
  ];

  const updateResponse = await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A${rowIndex}:J${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });

  return updateResponse.data;
}

/**
 * Elimina una fila buscándola por su ID.
 * En lugar de eliminar la fila (lo cual requiere batchUpdate),
 * limpiamos el contenido de la fila para evitar complejidad.
 * Para una eliminación real, usamos batchUpdate con deleteDimension.
 */
export async function deleteRow(id) {
  const sheets = getSheetsAPI();

  // Encontrar la fila con ese ID
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:A`,
  });

  const ids = response.data.values || [];
  let rowIndex = -1;

  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) {
      rowIndex = i; // 0-indexed para deleteDimension
      break;
    }
  }

  if (rowIndex === -1) {
    throw new Error(`Orden con ID "${id}" no encontrada.`);
  }

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

  // Eliminar la fila completa
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetIdNumeric,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });

  return { deleted: true, id };
}

/**
 * Obtiene el último ID utilizado para generar el siguiente.
 */
export async function getLastId() {
  const sheets = getSheetsAPI();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:A`,
  });

  const ids = response.data.values || [];
  
  if (ids.length <= 1) return null; // Solo header

  const lastId = ids[ids.length - 1][0];
  return lastId;
}
