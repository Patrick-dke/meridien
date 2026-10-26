# Publie Méridien sur GitHub Pages : envoie la branche main, puis le site construit sur gh-pages.
# Prérequis : un dépôt GitHub vide nommé « meridien » (https://github.com/new, sans README).
# Usage : powershell -ExecutionPolicy Bypass -File scripts\publier-github.ps1
param([string]$Depot = "https://github.com/Patrick-dke/meridien.git")

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

if (git status --porcelain) { throw "Des modifications ne sont pas validées : faites un commit avant de publier." }

$remotes = git remote
if ($remotes -notcontains "origin") { git remote add origin $Depot }
git push -u origin main
if ($LASTEXITCODE) { throw "L'envoi de main a échoué (le dépôt existe-t-il ?)." }

# Le site vit sous https://patrick-dke.github.io/meridien/ : toutes les adresses portent ce préfixe.
$env:NEXT_PUBLIC_BASE_PATH = "/meridien"
$env:NEXT_PUBLIC_SITE_URL = "https://patrick-dke.github.io"
$env:NEXT_TELEMETRY_DISABLED = "1"
npm run build
if ($LASTEXITCODE) { throw "La construction du site a échoué." }

# Copie du site dans un dépôt temporaire, envoyé tel quel sur gh-pages.
# .nojekyll empêche GitHub d'ignorer le dossier _next.
$tmp = Join-Path $env:TEMP "meridien-gh-pages"
if (Test-Path $tmp) { Remove-Item -Recurse -Force $tmp }
Copy-Item -Recurse out $tmp
New-Item -ItemType File (Join-Path $tmp ".nojekyll") | Out-Null
git -C $tmp init -q
git -C $tmp checkout -q -b gh-pages
git -C $tmp add -A
git -C $tmp commit -q -m "Publication du site"
git -C $tmp push -f $Depot gh-pages
if ($LASTEXITCODE) { throw "L'envoi de gh-pages a échoué." }
Remove-Item -Recurse -Force $tmp

Write-Host ""
Write-Host "Site envoyé. Dans la page qui s'ouvre, vérifiez : Source = Deploy from a branch, Branch = gh-pages, / (root)."
Write-Host "Adresse du site (1 à 2 minutes après) : https://patrick-dke.github.io/meridien/"
Start-Process "https://github.com/Patrick-dke/meridien/settings/pages"
