@echo off
cd /d "C:\Users\eduar\OneDrive\Documentos\ihome-frontend"
echo Iniciando servidor de desenvolvimento iHome...
echo Acesse no iPhone: http://[SEU-IP-LOCAL]:3000
echo Para ver seu IP, abra o cmd e digite: ipconfig
echo.
set BROWSER=none
npm start
