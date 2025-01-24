# Create main project directory
New-Item -ItemType Directory -Path "MSOrdemSorteio"
Set-Location "MSOrdemSorteio"

# Create subdirectories
$directories = @(
    "static",
    "static/css",
    "static/js",
    "static/img",
    "templates"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir
}

# Create files
$files = @{
    "requirements.txt" = "flask==2.0.1`nopenpyxl==3.0.7"
    "static/css/style.css" = ""
    "static/js/main.js" = ""
    "templates/index.html" = ""
    "app.py" = ""
}

foreach ($file in $files.Keys) {
    New-Item -ItemType File -Path $file
    Set-Content -Path $file -Value $files[$file]
}

Write-Host "Project structure created successfully!"