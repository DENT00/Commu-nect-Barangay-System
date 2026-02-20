# Commu-nect Workspace Cleanup Script
Write-Host "Starting Commu-nect workspace cleanup..." -ForegroundColor Cyan

$itemsToRemove = @(
    ".firebase\",
    "firebase-debug.log",
    ".DS_Store",
    "Thumbs.db"
)

foreach ($item in $itemsToRemove) {
    if (Test-Path $item) {
        Remove-Item -Path $item -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "Removed: $item" -ForegroundColor Green
    }
}

Write-Host "Cleanup complete. Your workspace is clean!" -ForegroundColor Green