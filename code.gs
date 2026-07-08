const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

// Fungsi ini dijalankan SEKALI SAJA dari editor script untuk membuat Sheet & Header otomatis
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Setup Sheet Siswa
  let sheetSiswa = ss.getSheetByName("Siswa");
  if (!sheetSiswa) {
    sheetSiswa = ss.insertSheet("Siswa");
    sheetSiswa.appendRow(["id", "nis", "nisn", "nama", "jk", "kelas", "status", "tahunAjaran"]);
    // Data dummy awal
    sheetSiswa.appendRow([1, "2021001", "0123456789", "Ahmad Budi", "L", "1A", "Aktif", "2024/2025"]);
    sheetSiswa.appendRow([2, "2021002", "0123456780", "Siti Aminah", "P", "2B", "Aktif", "2024/2025"]);
  }
  
  return "Setup Database Berhasil!";
}

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Siswa");
  const data = sheet.getDataRange().getValues();
  
  const headers = data[0];
  const students = [];
  
  // Mulai dari index 1 untuk melewati baris header
  for (let i = 1; i < data.length; i++) {
    let obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j] !== "" ? data[i][j] : null;
    }
    students.push(obj);
  }
  
  // Mengembalikan data dalam format JSON
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    data: students
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Siswa");
    
    // Parse data JSON yang dikirim dari Frontend
    const payload = JSON.parse(e.postData.contents);
    const { action, data } = payload;
    
    if (action === "tambah_siswa") {
      // Generate ID baru (Timestamp)
      const newId = new Date().getTime();
      sheet.appendRow([
        newId, 
        data.nis, 
        data.nisn, 
        data.nama, 
        data.jk, 
        data.kelas, 
        data.status || "Aktif", 
        data.tahunAjaran
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success", 
        message: "Data siswa berhasil ditambahkan",
        id: newId
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: "Action tidak dikenali"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
