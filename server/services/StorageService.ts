/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import { bucket } from '../firebaseAdmin';

interface StoredFile {
  id: string;
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}

class StorageService {
  private localFiles: Map<string, StoredFile> = new Map();

  /**
   * Upload an image/file represented as a base64 string or binary buffer.
   * Uploads securely to Google Cloud Storage (GCS) if available, returning the GCS media URL.
   * If GCS is unavailable or fails, gracefully falls back to local memory storage.
   *
   * This structure is future-ready: any media file (images, video, audio) is parsed and saved
   * based on its mimeType.
   */
  public async uploadFile(base64Data: string, originalName: string = 'evidence.jpg'): Promise<string> {
    let cleanBase64 = base64Data;
    let mimeType = 'image/jpeg';

    if (base64Data.startsWith('data:')) {
      const match = base64Data.match(/^data:([^;]+);base64,(.*)$/);
      if (match) {
        mimeType = match[1];
        cleanBase64 = match[2];
      }
    }

    const buffer = Buffer.from(cleanBase64, 'base64');
    const id = crypto.randomUUID();

    try {
      if (bucket) {
        // Prepare GCS location
        const filePath = `reports/${id}_${originalName}`;
        const file = bucket.file(filePath);

        // Upload securely with explicit metadata
        await file.save(buffer, {
          metadata: {
            contentType: mimeType,
            cacheControl: 'public, max-age=31536000'
          },
          resumable: false
        });

        // Set access to public so that the client-side app can load the resource immediately
        try {
          await file.makePublic();
        } catch (pubErr: any) {
          console.warn('[StorageService] GCS makePublic skipped/failed (continuing without it):', pubErr.message);
        }

        // Generate standard public URL to the stored media asset
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;
        console.log(`[StorageService] Successfully uploaded asset to GCS: ${publicUrl}`);
        return publicUrl;
      }
    } catch (err: any) {
      console.warn('[StorageService] GCS upload encountered an issue, running local backup service:', err.message);
    }

    // Local sandbox fallback persistence
    this.localFiles.set(id, {
      id,
      buffer,
      mimeType,
      originalName,
    });

    console.log(`[StorageService] Written to local backup buffer. Path: /api/storage/${id}`);
    return `/api/storage/${id}`;
  }

  /**
   * Fetch a locally stored backup media asset by ID
   */
  public getFile(id: string): StoredFile | undefined {
    return this.localFiles.get(id);
  }
}

export const storageService = new StorageService();
