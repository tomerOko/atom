import os
from dotenv import load_dotenv

# Load environment variables from local.env file for development
load_dotenv('local.env')

# RabbitMQ Configuration
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', '5672'))
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'guest')
RABBITMQ_PASSWORD = os.getenv('RABBITMQ_PASSWORD', 'guest')

# MinIO Configuration
MINIO_ENDPOINT = os.getenv('MINIO_ENDPOINT', 'localhost:9000')
MINIO_ACCESS_KEY = os.getenv('MINIO_ACCESS_KEY', 'minioadmin')
MINIO_SECRET_KEY = os.getenv('MINIO_SECRET_KEY', 'minioadmin')
MINIO_BUCKET = os.getenv('MINIO_BUCKET', 'helmet-detection')

# Model Configuration
MODEL_PATH = os.getenv('MODEL_PATH', './models/yolov8n.pt')
CONFIDENCE_THRESHOLD = float(os.getenv('CONFIDENCE_THRESHOLD', '0.25'))
IOU_THRESHOLD = float(os.getenv('IOU_THRESHOLD', '0.4'))

# RabbitMQ Exchange and Queue Configuration
# Exchange to consume image processing requests from
IMAGE_PROCESSING_EXCHANGE = 'helmet_detection_image_processing_exchange'
# Exchange to publish processing results to
PROCESSING_RESULTS_EXCHANGE = 'ai_service_processing_results_exchange'
# Our own queue for consuming processing requests
AI_SERVICE_QUEUE = 'ai_service_image_processing_queue'
# Routing key - using catch-all as specified
ROUTING_KEY = '#' 