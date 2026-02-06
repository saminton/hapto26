@echo off

REM Choose projet name
set /p "name=Nom du projet : "
echo.

REM Choose package manager
echo Package manager :
echo [n] npm
echo [v] nvm
echo [p] pnpm

set /p "k=Votre choix : "
echo.
echo.

REM Copy htaccess
copy "%CD%\..\www\.htaccess.dev" "%CD%\..\www\.htaccess"
copy "%CD%\..\www\wp-content\themes\front\.env.dev" "%CD%\..\www\wp-content\themes\front\.env"

REM Set env.dev projet name
echo.>> "%CD%\..\www\wp-content\themes\front\.env"
echo NAME=%name%>> "%CD%\..\www\wp-content\themes\front\.env"

REM Install packages
cd "%CD%\..\www\wp-content\themes\front"

if /i "%k%"=="n" (
   npm i
)

if /i "%k%"=="v" (
   nvm use
   npm i
)

if /i "%k%"=="p" (
   pnpm i
)
