import { google, drive_v3 } from "googleapis"
import { Readable } from "stream"
import type {
  DriveFile,
  DriveFileDetails,
  DriveFolderResult,
  DriveUploadResult,
  DrivePermission,
  DriveRole,
} from "@/types/google-drive"

// Initialize Google Drive client.
// Use googleapis' bundled `google.auth.JWT` so the auth instance matches the
// type expected by `google.drive(...)` and the client resolves to v3.
const initGoogleDriveClient = (): drive_v3.Drive => {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/drive"],
  })

  return google.drive({ version: "v3", auth })
}

// Create a folder in Google Drive
export const createFolder = async (
  folderName: string,
  parentFolderId?: string,
): Promise<DriveFolderResult> => {
  const drive = initGoogleDriveClient()

  const response = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentFolderId ? [parentFolderId] : undefined,
    },
    fields: "id, name, webViewLink",
    supportsAllDrives: true,
  })

  return {
    id: response.data.id ?? "",
    name: response.data.name ?? folderName,
    webViewLink: response.data.webViewLink ?? "",
  }
}

// List files and folders in a folder
export const listFilesInFolder = async (
  folderId: string,
  query?: string,
): Promise<DriveFile[]> => {
  const drive = initGoogleDriveClient()

  // Step 1: Get full path of current folderId (e.g., /abc/notes)
  const buildFolderPath = async (id: string): Promise<string> => {
    const pathParts: string[] = []
    let currentId: string | undefined = id

    while (currentId) {
      const id: string = currentId
      const response = await drive.files.get({
        fileId: id,
        fields: "id, name, parents",
        supportsAllDrives: true,
      })

      pathParts.unshift(response.data.name ?? "")
      currentId = response.data.parents?.[0] ?? undefined
    }

    return "/" + pathParts.join("/")
  }

  // Step 2: List direct children of the folderId
  let q = `'${folderId}' in parents and trashed = false`
  if (query) q += ` and name contains '${query}'`

  const res = await drive.files.list({
    q,
    fields:
      "files(id, name, mimeType, size, webViewLink, thumbnailLink, createdTime, modifiedTime)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    corpora: "allDrives",
  })

  const children = res.data.files ?? []
  const parentPath = await buildFolderPath(folderId)

  // Step 3: Build final DriveFile array
  return children
    .filter(
      (file): file is drive_v3.Schema$File & { id: string; name: string } =>
        !!file.id && !!file.name,
    )
    .map((file) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType ?? "application/octet-stream",
      fullPath: `${parentPath}/${file.name}`,
      size: file.size ? Number(file.size) : undefined,
      webViewLink: file.webViewLink ?? undefined,
      thumbnailLink: file.thumbnailLink ?? undefined,
      createdTime: file.createdTime ?? undefined,
      modifiedTime: file.modifiedTime ?? undefined,
    }))
}

// Get file or folder details
export const getFileDetails = async (
  fileId: string,
): Promise<DriveFileDetails> => {
  const drive = initGoogleDriveClient()

  const response = await drive.files.get({
    fileId,
    fields:
      "id, name, mimeType, size, webViewLink, thumbnailLink, createdTime, modifiedTime, parents",
    supportsAllDrives: true,
  })

  const data = response.data

  return {
    id: data.id ?? "",
    name: data.name ?? "",
    mimeType: data.mimeType ?? "application/octet-stream",
    size: data.size ? Number(data.size) : undefined,
    webViewLink: data.webViewLink ?? undefined,
    thumbnailLink: data.thumbnailLink ?? undefined,
    createdTime: data.createdTime ?? undefined,
    modifiedTime: data.modifiedTime ?? undefined,
    parents: data.parents ?? undefined,
  }
}

// Upload file to Google Drive
export const uploadFileToDrive = async (
  file: File,
  folderId?: string,
): Promise<DriveUploadResult> => {
  const drive = initGoogleDriveClient()

  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Upload file
  const response = await drive.files.create({
    requestBody: {
      name: file.name,
      parents: folderId ? [folderId] : undefined,
    },
    media: {
      mimeType: file.type || "application/octet-stream",
      body: Readable.from(buffer),
    },
    fields: "id, name, mimeType, size, webViewLink",
    supportsAllDrives: true,
  })

  // Get updated file with webViewLink
  const fileData = await drive.files.get({
    fileId: response.data.id ?? "",
    fields: "id, name, mimeType, size, webViewLink",
    supportsAllDrives: true,
  })

  return {
    id: fileData.data.id ?? "",
    name: fileData.data.name ?? file.name,
    url: fileData.data.webViewLink ?? "",
    mimeType: fileData.data.mimeType ?? file.type ?? "application/octet-stream",
    size: fileData.data.size ? Number(fileData.data.size) : 0,
  }
}

// Delete file or folder from Google Drive
export const deleteFileFromDrive = async (fileId: string): Promise<void> => {
  const drive = initGoogleDriveClient()
  await drive.files.delete({ fileId, supportsAllDrives: true })
}

// Share a file or folder with a specific user
export const shareFileWithUser = async (
  fileId: string,
  email: string,
  role: DriveRole = "reader",
): Promise<void> => {
  const drive = initGoogleDriveClient()

  await drive.permissions.create({
    fileId,
    requestBody: {
      type: "user",
      role,
      emailAddress: email,
    },
    supportsAllDrives: true,
  })
}

// Remove sharing for a specific user
export const removeUserAccess = async (
  fileId: string,
  permissionId: string,
): Promise<void> => {
  const drive = initGoogleDriveClient()

  await drive.permissions.delete({
    fileId,
    permissionId,
    supportsAllDrives: true,
  })
}

// List permissions for a file or folder
export const listPermissions = async (
  fileId: string,
): Promise<DrivePermission[]> => {
  const drive = initGoogleDriveClient()

  const response = await drive.permissions.list({
    fileId,
    fields: "permissions(id, type, emailAddress, role)",
    supportsAllDrives: true,
  })

  return (response.data.permissions ?? []).map((permission) => ({
    id: permission.id ?? "",
    type: permission.type ?? undefined,
    emailAddress: permission.emailAddress ?? undefined,
    role: permission.role ?? undefined,
  }))
}

// Move a file to a different folder
export const moveFile = async (
  fileId: string,
  newFolderId: string,
  oldFolderId?: string,
): Promise<void> => {
  const drive = initGoogleDriveClient()

  // First get the file to check its current parents
  const file = await drive.files.get({
    fileId,
    fields: "parents",
    supportsAllDrives: true,
  })

  // Remove from old folder and add to new folder
  await drive.files.update({
    fileId,
    removeParents: oldFolderId ?? file.data.parents?.join(",") ?? undefined,
    addParents: newFolderId,
    supportsAllDrives: true,
  })
}

// Rename a file or folder
export const renameFile = async (
  fileId: string,
  newName: string,
): Promise<void> => {
  const drive = initGoogleDriveClient()

  await drive.files.update({
    fileId,
    requestBody: {
      name: newName,
    },
    supportsAllDrives: true,
  })
}
