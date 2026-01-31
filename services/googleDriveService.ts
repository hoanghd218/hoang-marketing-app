// Configuration
// NOTE: In a real production app, you need to create a project in Google Cloud Console,
// enable the Drive API, and create an OAuth 2.0 Client ID.
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; // Replace with actual ID if available
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

/**
 * authenticates the user using Google Identity Services (GIS)
 */
const authenticate = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error("Google Identity Services not loaded."));
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.error) {
          reject(response);
        } else {
          resolve(response.access_token);
        }
      },
    });

    // Triggers the popup
    tokenClient.requestAccessToken();
  });
};

/**
 * Finds or Creates the "Thumbnail" folder
 */
const getOrCreateFolder = async (accessToken: string, folderName: string): Promise<string> => {
  // 1. Search for folder
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false&fields=files(id, name)`;
  
  const searchRes = await fetch(searchUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  const searchData = await searchRes.json();

  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // 2. Create if not exists
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });

  const createData = await createRes.json();
  return createData.id;
};

/**
 * Uploads a base64 image to a specific folder
 */
const uploadFile = async (accessToken: string, folderId: string, base64Data: string, fileName: string) => {
  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: 'image/png',
  };

  // Prepare multipart body
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  // Clean base64 string
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

  const body =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: image/png\r\n' +
    'Content-Transfer-Encoding: base64\r\n' +
    '\r\n' +
    cleanBase64 +
    close_delim;

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'multipart/related; boundary=' + boundary,
    },
    body: body
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Upload failed');
  }

  return await response.json();
};

export const saveImageToDrive = async (base64Image: string, fileName: string): Promise<void> => {
  // Check if CLIENT_ID is configured (Placeholder check)
  if (CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID')) {
    alert("Google Drive API is not configured. Please add a valid Client ID in services/googleDriveService.ts to use this feature.");
    throw new Error("Missing Client ID");
  }

  try {
    // 1. Authenticate
    const accessToken = await authenticate();
    
    // 2. Get 'Thumbnail' folder ID
    const folderId = await getOrCreateFolder(accessToken, 'Thumbnail');
    
    // 3. Upload File
    await uploadFile(accessToken, folderId, base64Image, fileName);
    
    return;
  } catch (error) {
    console.error("Drive Save Error:", error);
    throw error;
  }
};