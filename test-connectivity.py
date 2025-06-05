#!/usr/bin/env python3

import socket
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('local.env')

def test_port_connectivity(host, port, service_name):
    """Test if a port is reachable"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result == 0:
            print(f"✅ {service_name} port {port} is reachable")
            return True
        else:
            print(f"❌ {service_name} port {port} is not reachable")
            return False
    except Exception as e:
        print(f"❌ {service_name} connection error: {e}")
        return False

def test_rabbitmq_connection():
    """Test RabbitMQ connection"""
    try:
        import pika
        
        rabbitmq_host = os.getenv('RABBITMQ_HOST', 'localhost')
        rabbitmq_port = int(os.getenv('RABBITMQ_PORT', '5672'))
        rabbitmq_user = os.getenv('RABBITMQ_USER', 'guest')
        rabbitmq_password = os.getenv('RABBITMQ_PASSWORD', 'guest')
        
        credentials = pika.PlainCredentials(rabbitmq_user, rabbitmq_password)
        parameters = pika.ConnectionParameters(
            host=rabbitmq_host,
            port=rabbitmq_port,
            credentials=credentials
        )
        
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        
        print("✅ RabbitMQ connection successful")
        connection.close()
        return True
        
    except ImportError:
        print("⚠️  pika not installed, installing...")
        os.system("pip install pika")
        return test_rabbitmq_connection()
    except Exception as e:
        print(f"❌ RabbitMQ connection failed: {e}")
        return False

def test_minio_connection():
    """Test MinIO connection"""
    try:
        from minio import Minio
        
        minio_endpoint = os.getenv('MINIO_ENDPOINT', 'localhost:9000')
        minio_access_key = os.getenv('MINIO_ACCESS_KEY', 'minioadmin')
        minio_secret_key = os.getenv('MINIO_SECRET_KEY', 'minioadmin')
        
        client = Minio(
            minio_endpoint,
            access_key=minio_access_key,
            secret_key=minio_secret_key,
            secure=False
        )
        
        # Test connection by listing buckets
        buckets = list(client.list_buckets())
        print("✅ MinIO connection successful")
        print(f"   Found {len(buckets)} buckets")
        return True
        
    except ImportError:
        print("⚠️  minio not installed, installing...")
        os.system("pip install minio")
        return test_minio_connection()
    except Exception as e:
        print(f"❌ MinIO connection failed: {e}")
        return False

def main():
    """Run all connectivity tests"""
    print("🔍 Testing AI Service connectivity to Docker Compose services...\n")
    
    # Load configuration from environment
    rabbitmq_host = os.getenv('RABBITMQ_HOST', 'localhost')
    rabbitmq_port = int(os.getenv('RABBITMQ_PORT', '5672'))
    minio_endpoint = os.getenv('MINIO_ENDPOINT', 'localhost:9000')
    minio_host = minio_endpoint.split(':')[0]
    minio_port = int(minio_endpoint.split(':')[1])
    
    all_tests_passed = True
    
    # Test port connectivity
    print("📡 Testing port connectivity...")
    tests = [
        (rabbitmq_host, rabbitmq_port, "RabbitMQ"),
        (minio_host, minio_port, "MinIO")
    ]
    
    for host, port, service in tests:
        if not test_port_connectivity(host, port, service):
            all_tests_passed = False
    
    # Test application connectivity
    print("\n🔌 Testing application connectivity...")
    
    if not test_rabbitmq_connection():
        all_tests_passed = False
    
    if not test_minio_connection():
        all_tests_passed = False
    
    print("\n" + "="*50)
    if all_tests_passed:
        print("🎉 All AI Service connectivity tests passed!")
        print("\nYou can now run the AI Service locally:")
        print("  cd ai-service && python main.py")
        print("\nOr debug it in VS Code using the 'Debug AI Service' configuration")
    else:
        print("❌ Some tests failed. Please check that Docker Compose is running:")
        print("  docker-compose -f docker-compose.dev.yml up -d")
        sys.exit(1)

if __name__ == "__main__":
    main() 