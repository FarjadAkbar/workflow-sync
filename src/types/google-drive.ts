// Google Drive domain types
//
// Clean, framework-agnostic shapes returned by the Drive helpers in
// `src/lib/google-drive.ts`. Keeping these decoupled from the raw
// `googleapis` `Schema$*` types gives callers a stable, fully-typed surface.

/** Access role granted to a Drive permission. */
export type DriveRole = "reader" | "writer" | "commenter";

/** A file or folder returned when listing the contents of a Drive folder. */
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  fullPath: string;
  size?: number;
  webViewLink?: string;
  thumbnailLink?: string;
  createdTime?: string;
  modifiedTime?: string;
}

/** Detailed metadata for a single Drive file or folder. */
export interface DriveFileDetails {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  webViewLink?: string;
  thumbnailLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  parents?: string[];
}

/** Result of creating a folder in Drive. */
export interface DriveFolderResult {
  id: string;
  name: string;
  webViewLink: string;
}

/** Result of uploading a file to Drive. */
export interface DriveUploadResult {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

/** A permission entry attached to a Drive file or folder. */
export interface DrivePermission {
  id: string;
  type?: string;
  emailAddress?: string;
  role?: string;
}
