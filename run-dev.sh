docker-compose -f docker-compose.dev.yml up -d

echo "you are now can run the client with 'npm run dev' in the client folder, and run and debug the backend and image-analysis with the debuggers of each repo"

echo "########################################################################################"
echo "if you are not running the client / backend / image-analysis separately, uncomment the appropriate lines in the script"
# cd client
# npm run dev

# cd ../image-analysis
# source .venv/bin/activate
# python3 app.py

# cd ../
# cd backend
# npm start
