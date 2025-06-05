import os
import logging
import signal
import sys
from typing import Dict
from helmet_detector import HelmetDetector
from message_handler import MessageHandler
from storage_service import StorageService
from config import *

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HelmetDetectionService:
    def __init__(self):
        """
        Initialize the helmet detection service
        """
        self.detector = None
        self.message_handler = None
        self.storage_service = None
        self.setup_services()

    def setup_services(self):
        """
        Initialize all service components
        """
        try:
            # Initialize storage service
            self.storage_service = StorageService()
            logger.info("Storage service initialized")

            # Initialize message handler
            self.message_handler = MessageHandler()
            logger.info("Message handler initialized")

            # Download and initialize YOLO model
            self.setup_model()
            
            # Initialize helmet detector
            self.detector = HelmetDetector(
                model_path=MODEL_PATH,
                confidence_threshold=CONFIDENCE_THRESHOLD,
                iou_threshold=IOU_THRESHOLD
            )
            logger.info("Helmet detector initialized")

        except Exception as e:
            logger.error(f"Failed to setup services: {e}")
            raise

    def setup_model(self):
        """
        Download YOLO model if it doesn't exist
        """
        os.makedirs('./models', exist_ok=True)
        
        if not os.path.exists(MODEL_PATH):
            logger.info("Downloading YOLO model...")
            # This will automatically download the model
            from ultralytics import YOLO
            model = YOLO('yolov8n.pt')  # This downloads the model
            model.save('./models/yolov8n.pt')
            logger.info("YOLO model downloaded and saved")

    def process_image_request(self, message: Dict) -> Dict:
        """
        Process image detection request
        """
        try:
            image_filename = message.get('image_filename')
            image_id = message.get('image_id')
            
            if not image_filename:
                raise ValueError("No image filename provided in message")

            logger.info(f"Processing image: {image_filename}")

            # Download image from MinIO
            local_image_path = self.storage_service.download_image(image_filename)
            
            # Generate annotated filename
            annotated_filename = self.storage_service.generate_annotated_filename(image_filename)
            annotated_local_path = local_image_path.replace(image_filename, annotated_filename)
            
            # Process image with helmet detection
            processing_result = self.detector.process_image(local_image_path, annotated_local_path)
            
            if processing_result['success']:
                # Upload annotated image to MinIO
                upload_success = self.storage_service.upload_image(annotated_local_path, annotated_filename)
                
                if not upload_success:
                    logger.warning(f"Failed to upload annotated image: {annotated_filename}")

                # Prepare result message
                result = {
                    'image_id': image_id,
                    'image_filename': image_filename,
                    'annotated_filename': annotated_filename if upload_success else None,
                    'processing_status': 'completed',
                    'total_people': processing_result['total_people'],
                    'people_with_helmets': processing_result['people_with_helmets'],
                    'compliance_rate': processing_result['compliance_rate'],
                    'detections': processing_result['detections'],
                    'timestamp': message.get('timestamp'),
                    'processing_time': None  # Could add timing if needed
                }

            else:
                # Handle processing failure
                result = {
                    'image_id': image_id,
                    'image_filename': image_filename,
                    'annotated_filename': None,
                    'processing_status': 'failed',
                    'error': processing_result.get('error', 'Unknown error'),
                    'total_people': 0,
                    'people_with_helmets': 0,
                    'compliance_rate': 0,
                    'detections': [],
                    'timestamp': message.get('timestamp')
                }

            # Cleanup temporary files
            self.storage_service.cleanup_temp_file(local_image_path)
            if os.path.exists(annotated_local_path):
                self.storage_service.cleanup_temp_file(annotated_local_path)

            logger.info(f"Completed processing for image: {image_filename}")
            return result

        except Exception as e:
            logger.error(f"Error processing image request: {e}")
            return {
                'image_id': message.get('image_id'),
                'image_filename': message.get('image_filename'),
                'annotated_filename': None,
                'processing_status': 'failed',
                'error': str(e),
                'total_people': 0,
                'people_with_helmets': 0,
                'compliance_rate': 0,
                'detections': [],
                'timestamp': message.get('timestamp')
            }

    def run(self):
        """
        Start the helmet detection service
        """
        logger.info("Starting Helmet Detection Service...")
        
        # Setup graceful shutdown
        def signal_handler(signum, frame):
            logger.info("Received shutdown signal")
            self.shutdown()
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)

        try:
            # Setup message consumer
            self.message_handler.setup_consumer(self.process_image_request)
            
            # Start consuming messages
            logger.info("Service ready - waiting for image processing requests...")
            self.message_handler.start_consuming()
            
        except Exception as e:
            logger.error(f"Error running service: {e}")
            self.shutdown()
            raise

    def shutdown(self):
        """
        Graceful shutdown of the service
        """
        logger.info("Shutting down Helmet Detection Service...")
        
        if self.message_handler:
            self.message_handler.close()

if __name__ == "__main__":
    try:
        service = HelmetDetectionService()
        service.run()
    except Exception as e:
        logger.error(f"Failed to start service: {e}")
        sys.exit(1) 