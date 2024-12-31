# Use a Python base image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Streamlit app
COPY . .

# Expose port (Streamlit default port is 8501)
EXPOSE 8501

# Run the Streamlit app
CMD ["streamlit", "run", "Home.py"]
