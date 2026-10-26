# Publie la copie de Méridien sur Firebase Hosting (https://meridien-academie.web.app),
# pour les visiteurs dont le fournisseur d'accès bloque github.io.
# Prérequis : firebase-tools installé et connecté (firebase login).
# Usage : powershell -ExecutionPolicy Bypass -File scripts\publier-firebase.ps1
param([string]$Projet = "meridien-academie")

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

# Ici le site vit à la racine du domaine : pas de sous-chemin, contrairement à GitHub Pages.
Remove-Item Env:NEXT_PUBLIC_BASE_PATH -ErrorAction SilentlyContinue
$env:NEXT_PUBLIC_SITE_URL = "https://$Projet.web.app"
$env:NEXT_TELEMETRY_DISABLED = "1"
npm run build
if ($LASTEXITCODE) { throw "La construction du site a échoué." }

firebase deploy --only hosting --project $Projet --non-interactive
if ($LASTEXITCODE) { throw "Le déploiement Firebase a échoué." }

Write-Host ""
Write-Host "Site publié : https://$Projet.web.app/"
