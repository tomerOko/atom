# 1. Start infrastructure
docker-compose -f docker-compose.dev.yml up -d

# 2. Test connectivity (optional)
cd backend && node ../test-connectivity.js
cd ../ai-service && python ../test-connectivity.py

# 3. Run services
# Terminal 1 - Backend:
cd backend && npm run dev

# Terminal 2 - AI Service:
cd ai-service && source .venv/bin/activate && python main.py