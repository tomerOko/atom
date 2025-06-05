import os
import tempfile
from minio import Minio
from minio.error import S3Error
import logging
from config import *

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StorageService:
    def __init__(self):
        """
        Initialize MinIO client
        """
        try:
            self.client = Minio(
                MINIO_ENDPOINT,
                access_key=MINIO_ACCESS_KEY,
                secret_key=MINIO_SECRET_KEY,
                secure=False  # Set to True if using HTTPS
            )
            
            # Create bucket if it doesn't exist
            if not self.client.bucket_exists(MINIO_BUCKET):
                self.client.make_bucket(MINIO_BUCKET)
                logger.info(f"Created bucket: {MINIO_BUCKET}")
            
            logger.info("Successfully initialized MinIO client")
            
        except Exception as e:
            logger.error(f"Failed to initialize MinIO client: {e}")
            raise

    def download_image(self, filename: str) -> str:
        """
        Download image from MinIO to temporary file
        Returns the local file path
        """
        try:
            # Create temporary file
            temp_dir = tempfile.mkdtemp()
            local_path = os.path.join(temp_dir, filename)
            
            # Download file from MinIO
            self.client.fget_object(MINIO_BUCKET, filename, local_path)
            logger.info(f"Downloaded {filename} to {local_path}")
            
            return local_path
            
        except S3Error as e:
            logger.error(f"MinIO error downloading {filename}: {e}")
            raise
        except Exception as e:
            logger.error(f"Error downloading {filename}: {e}")
            raise

    def upload_image(self, local_path: str, filename: str) -> bool:
        """
        Upload image from local path to MinIO
        """
        try:
            self.client.fput_object(MINIO_BUCKET, filename, local_path)
            logger.info(f"Uploaded {local_path} as {filename}")
            return True
            
        except S3Error as e:
            logger.error(f"MinIO error uploading {filename}: {e}")
            return False
        except Exception as e:
            logger.error(f"Error uploading {filename}: {e}")
            return False

    def file_exists(self, filename: str) -> bool:
        """
        Check if file exists in MinIO bucket
        """
        try:
            self.client.stat_object(MINIO_BUCKET, filename)
            return True
        except S3Error:
            return False
        except Exception as e:
            logger.error(f"Error checking if {filename} exists: {e}")
            return False

    def cleanup_temp_file(self, file_path: str) -> None:
        """
        Clean up temporary file and directory
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                # Also remove the temp directory if empty
                temp_dir = os.path.dirname(file_path)
                if os.path.exists(temp_dir) and not os.listdir(temp_dir):
                    os.rmdir(temp_dir)
                logger.info(f"Cleaned up temp file: {file_path}")
        except Exception as e:
            logger.error(f"Error cleaning up {file_path}: {e}")

    def generate_annotated_filename(self, original_filename: str) -> str:
        """
        Generate filename for annotated image
        """
        name, ext = os.path.splitext(original_filename)
        return f"{name}_annotated{ext}" 