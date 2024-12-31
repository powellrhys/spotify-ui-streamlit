# Build and push frontend container
cd ../frontend
docker build -t powellrhys/spotify-frontend .
docker push powellrhys/spotify-frontend

# Return to project root
cd ..

# Build and push backend container
cd backend
docker build -t powellrhys/spotify-backend .
docker push powellrhys/spotify-backend

# Return to project root
cd ..
