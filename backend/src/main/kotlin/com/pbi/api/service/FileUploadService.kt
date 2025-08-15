package com.pbi.api.service

import com.cloudinary.Cloudinary
import com.cloudinary.utils.ObjectUtils
import com.pbi.api.exception.FileUploadException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.springframework.stereotype.Service
import java.io.File

@Service
class FileUploadService(private val cloudinary: Cloudinary) {

    suspend fun uploadImage(file: File, path: String): FileUploadResult {
        return withContext(Dispatchers.IO) {
            try {
                val options = ObjectUtils.asMap(
                    "public_id", path,
                    "overwrite", true,
                    "resource_type", "image"
                )

                val uploadResult = cloudinary.uploader().upload(file.readBytes(), options)

                val url = uploadResult["secure_url"] as String
                val publicId = uploadResult["public_id"] as String

                FileUploadResult(
                    url = url,
                    filename = publicId,
                )
            } catch (e: Exception) {
                throw FileUploadException("Failed to upload file to Cloudinary: ${e.message}", e)
            }
        }
    }

    suspend fun deleteFile(publicId: String): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                val options = ObjectUtils.asMap(
                    "resource_type", "image"
                )
                cloudinary.uploader().destroy(publicId, options)
                true
            } catch (e: Exception) {
                false
            }
        }
    }
}

data class FileUploadResult(
    val url: String,
    val filename: String
)
