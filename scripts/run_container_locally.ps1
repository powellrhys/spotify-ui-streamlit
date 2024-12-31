param (
    [Parameter(Mandatory = $true, HelpMessage = "Container to Run")]
    [string]$container
)

# Define image name
$imageName = "powellrhys/spotify-$container" 

# Define image port
if ($container -eq "backend") {
    $port = 3000
} else {
    $port = 8501
}

# Pull image from Docker Hub
docker pull $imageName

# Get the list of running Docker containers
$containers = docker ps --quiet  # "--quiet" returns only the container IDs

# Check if there are any running containers
if ($containers.Count -gt 0) {
    # Loop through each container ID and stop it
    foreach ($container in $containers) {
        Write-Host "Stopping container with ID: $container"
        docker stop $container
        docker rm $container
    }
} else {
    Write-Host "No active Docker containers found."
}

# Empty array to store environmental variables
$environment_variables_array = @()

# Iterate through .env file to retrieve variables
Get-Content .env | ForEach-Object {
    $name, $value = $_ -split '=', 2
    $environment_variables_array += $value.Replace("'", "")
}

# Map sourced environmental variables to correct keys
$client_id = $environment_variables_array[0]
$client_secret = $environment_variables_array[1]
$spotify_user_id = $environment_variables_array[2]
$spotify_username = $environment_variables_array[3]
$spotify_password = $environment_variables_array[4]
$blob_storage_connection_string = $environment_variables_array[5]
$host_url = $environment_variables_array[6]

# Run Docker Container
docker run -p ${port}:${port} `
    -e client_id=$client_id `
    -e client_secret=$client_secret `
    -e spotify_user_id=$spotify_user_id `
    -e spotify_username=$spotify_username `
    -e spotify_password=$spotify_password `
    -e blob_storage_connection_string=$blob_storage_connection_string `
    -e host_url=$host_url `
    $imageName
