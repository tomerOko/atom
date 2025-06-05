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
CONFIDENCE_THRESHOLD = float(os.getenv('CONFIDENCE_THRESHOLD', '0.5'))
IOU_THRESHOLD = float(os.getenv('IOU_THRESHOLD', '0.4'))

# Queue Names
IMAGE_PROCESSING_QUEUE = 'image_processing'
PROCESSING_RESULTS_QUEUE = 'processing_results' 