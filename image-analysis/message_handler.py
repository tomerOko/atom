import json
import pika
import logging
from typing import Dict, Callable
from datetime import datetime
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
        Establish connection to RabbitMQ and setup exchanges
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
            
            # Declare exchanges as topic exchanges with durable=True
            self.channel.exchange_declare(
                exchange=IMAGE_PROCESSING_EXCHANGE,
                exchange_type='topic',
                durable=True
            )
            self.channel.exchange_declare(
                exchange=PROCESSING_RESULTS_EXCHANGE,
                exchange_type='topic',
                durable=True
            )
            
            # Declare our own queue for consuming processing requests
            self.channel.queue_declare(queue=AI_SERVICE_QUEUE, durable=True)
            
            # Bind our queue to the image processing exchange with catch-all routing key
            self.channel.queue_bind(
                exchange=IMAGE_PROCESSING_EXCHANGE,
                queue=AI_SERVICE_QUEUE,
                routing_key=ROUTING_KEY
            )
            
            logger.info("Successfully connected to RabbitMQ and setup exchanges")
            
        except Exception as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}")
            raise

    def publish_result(self, result: Dict) -> None:
        """
        Publish processing result to the results exchange with proper message wrapping
        """
        try:
            # Wrap payload in required format with data field
            message = {
                "data": result
            }
            
            message_body = json.dumps(message)
            self.channel.basic_publish(
                exchange=PROCESSING_RESULTS_EXCHANGE,
                routing_key=ROUTING_KEY,  # Using catch-all routing key
                body=message_body,
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
                # Parse message and extract data payload
                message = json.loads(body.decode('utf-8'))
                
                # Extract the actual payload from the data field
                if 'data' in message:
                    data = message['data']
                else:
                    # Fallback for messages not wrapped in data field
                    data = message
                
                logger.info(f"Received processing request: {data}")
                
                # Process the image
                result = processing_callback(data)
                
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
            queue=AI_SERVICE_QUEUE,
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