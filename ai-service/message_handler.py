import json
import pika
import logging
from typing import Dict, Callable
from config import *

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MessageHandler:
    def __init__(self):
        self.connection = None
        self.channel = None
        self.connect()

    def connect(self):
        """
        Establish connection to RabbitMQ
        """
        try:
            credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
            parameters = pika.ConnectionParameters(
                host=RABBITMQ_HOST,
                port=RABBITMQ_PORT,
                credentials=credentials
            )
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            
            # Declare queues
            self.channel.queue_declare(queue=IMAGE_PROCESSING_QUEUE, durable=True)
            self.channel.queue_declare(queue=PROCESSING_RESULTS_QUEUE, durable=True)
            
            logger.info("Successfully connected to RabbitMQ")
            
        except Exception as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}")
            raise

    def publish_result(self, result: Dict) -> None:
        """
        Publish processing result to the results queue
        """
        try:
            message = json.dumps(result)
            self.channel.basic_publish(
                exchange='',
                routing_key=PROCESSING_RESULTS_QUEUE,
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Make message persistent
                )
            )
            logger.info(f"Published result for image: {result.get('image_filename', 'unknown')}")
            
        except Exception as e:
            logger.error(f"Failed to publish result: {e}")
            raise

    def setup_consumer(self, processing_callback: Callable[[Dict], Dict]) -> None:
        """
        Setup consumer for image processing requests
        """
        def process_message(ch, method, properties, body):
            try:
                # Parse message
                message = json.loads(body.decode('utf-8'))
                logger.info(f"Received processing request: {message}")
                
                # Process the image
                result = processing_callback(message)
                
                # Publish result
                self.publish_result(result)
                
                # Acknowledge message
                ch.basic_ack(delivery_tag=method.delivery_tag)
                
            except Exception as e:
                logger.error(f"Error processing message: {e}")
                # Reject message and requeue
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

        # Configure consumer
        self.channel.basic_qos(prefetch_count=1)
        self.channel.basic_consume(
            queue=IMAGE_PROCESSING_QUEUE,
            on_message_callback=process_message
        )

    def start_consuming(self) -> None:
        """
        Start consuming messages
        """
        logger.info("Starting to consume messages...")
        try:
            self.channel.start_consuming()
        except KeyboardInterrupt:
            logger.info("Stopping consumer...")
            self.channel.stop_consuming()
            self.connection.close()

    def close(self) -> None:
        """
        Close connection to RabbitMQ
        """
        if self.connection and not self.connection.is_closed:
            self.connection.close()
            logger.info("RabbitMQ connection closed") 