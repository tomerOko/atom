#!/usr/bin/env node

const net = require('net');
const { MongoClient } = require('mongodb');
const amqp = require('amqplib');
const Minio = require('minio');

// Test configuration
const tests = {
  mongodb: {
    host: 'localhost',
    port: 27017,
    uri: 'mongodb://admin:password@localhost:27017/helmet_detection?authSource=admin'
  },
  rabbitmq: {
    host: 'localhost',
    port: 5672,
    url: 'amqp://guest:guest@localhost:5672'
  },
  minio: {
    host: 'localhost',
    port: 9000,
    endpoint: 'localhost',
    accessKey: 'minioadmin',
    secretKey: 'minioadmin'
  }
};

// Test port connectivity
function testPort(host, port, name) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    
    socket.setTimeout(5000);
    
    socket.on('connect', () => {
      console.log(`✅ ${name} port ${port} is reachable`);
      socket.destroy();
      resolve();
    });
    
    socket.on('timeout', () => {
      console.log(`❌ ${name} port ${port} timeout`);
      socket.destroy();
      reject(new Error(`${name} timeout`));
    });
    
    socket.on('error', (err) => {
      console.log(`❌ ${name} port ${port} error: ${err.message}`);
      reject(err);
    });
    
    socket.connect(port, host);
  });
}

// Test MongoDB connection
async function testMongoDB() {
  try {
    const client = new MongoClient(tests.mongodb.uri);
    await client.connect();
    await client.db('helmet_detection').admin().ping();
    console.log('✅ MongoDB connection successful');
    await client.close();
  } catch (error) {
    console.log(`❌ MongoDB connection failed: ${error.message}`);
    throw error;
  }
}

// Test RabbitMQ connection
async function testRabbitMQ() {
  try {
    const connection = await amqp.connect(tests.rabbitmq.url);
    const channel = await connection.createChannel();
    console.log('✅ RabbitMQ connection successful');
    await channel.close();
    await connection.close();
  } catch (error) {
    console.log(`❌ RabbitMQ connection failed: ${error.message}`);
    throw error;
  }
}

// Test MinIO connection
async function testMinIO() {
  try {
    const minioClient = new Minio.Client({
      endPoint: tests.minio.endpoint,
      port: tests.minio.port,
      useSSL: false,
      accessKey: tests.minio.accessKey,
      secretKey: tests.minio.secretKey
    });
    
    // Test bucket listing
    const buckets = await minioClient.listBuckets();
    console.log('✅ MinIO connection successful');
    console.log(`   Found ${buckets.length} buckets`);
  } catch (error) {
    console.log(`❌ MinIO connection failed: ${error.message}`);
    throw error;
  }
}

// Run all tests
async function runTests() {
  console.log('🔍 Testing connectivity to Docker Compose services...\n');
  
  try {
    // Test basic port connectivity
    console.log('📡 Testing port connectivity...');
    await testPort(tests.mongodb.host, tests.mongodb.port, 'MongoDB');
    await testPort(tests.rabbitmq.host, tests.rabbitmq.port, 'RabbitMQ');
    await testPort(tests.minio.host, tests.minio.port, 'MinIO');
    
    console.log('\n🔌 Testing application connectivity...');
    // Test application-level connectivity
    await testMongoDB();
    await testRabbitMQ();
    await testMinIO();
    
    console.log('\n🎉 All connectivity tests passed!');
    console.log('\nYou can now run your backend and ai-service locally:');
    console.log('  Backend: cd backend && npm run dev');
    console.log('  AI Service: cd ai-service && python main.py');
    
  } catch (error) {
    console.log('\n❌ Some tests failed. Please check that Docker Compose is running:');
    console.log('  docker-compose -f docker-compose.dev.yml up -d');
    process.exit(1);
  }
}

runTests(); 