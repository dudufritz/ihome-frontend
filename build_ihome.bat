@echo off
cd /d "C:\Users\eduar\OneDrive\Documentos\ihome-frontend"
echo Iniciando build do iHome Frontend...
set CI=false
npm run build
echo.
echo Build finalizado!
pause
