@echo off
echo ========================================
echo Netlify Deploy Script
echo ========================================
echo.

REM Verificar se o build existe
if not exist "dist\" (
    echo Build nao encontrado. Executando build...
    call npm run build
    if errorlevel 1 (
        echo Erro ao fazer build!
        pause
        exit /b 1
    )
)

echo.
echo Build encontrado em dist\
echo.
echo ========================================
echo Opcoes de Deploy:
echo ========================================
echo.
echo 1. Deploy manual (arraste a pasta dist para app.netlify.com)
echo 2. Instalar Netlify CLI e fazer deploy
echo 3. Sair
echo.
set /p choice="Escolha uma opcao (1-3): "

if "%choice%"=="1" (
    echo.
    echo Abra: https://app.netlify.com/drop
    echo Arraste a pasta: C:\Claudin\Nutriflow\dist
    echo.
    start https://app.netlify.com/drop
    explorer "C:\Claudin\Nutriflow\dist"
    pause
    exit /b 0
)

if "%choice%"=="2" (
    echo.
    echo Instalando Netlify CLI...
    call npm install -g netlify-cli
    if errorlevel 1 (
        echo Erro ao instalar CLI!
        pause
        exit /b 1
    )

    echo.
    echo Fazendo login no Netlify...
    call netlify login

    echo.
    echo Fazendo deploy para producao...
    call netlify deploy --prod --dir=dist

    if errorlevel 1 (
        echo Erro ao fazer deploy!
        pause
        exit /b 1
    )

    echo.
    echo ========================================
    echo Deploy concluido com sucesso!
    echo ========================================
    pause
    exit /b 0
)

echo Saindo...
exit /b 0
