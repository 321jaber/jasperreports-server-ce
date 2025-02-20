@ECHO OFF

rem
rem JasperReports Server common installation and upgrade script.
rem
rem Usage: do-js-setup.bat (install|upgrade){setup mode} (ce|pro){edition} {script option} {Ant target} [Ant options]
rem

rem -----------------------------------------------------------------------------

rem Directory paths are relative to JRS_HOME\buildomatic.
for /f tokens^=2-5^ delims^=.-_^" %%j in ('java -fullversion 2^>^&1') do @set "jver=%%j"
echo %jver%
IF %jver% GEQ 17 (
  echo "Copying additional jar file(s) that are needed very specific to jdk 17+ runtime."
  copy /Y .\install_resources\extra-jars-jdk17\asm*.jar .\lib
  copy /Y .\install_resources\extra-jars-jdk17\nashorn*.jar .\lib
) ELSE (
  echo "Deleting any existing jar file(s) that are needed very specific to jdk 17+ runtime."
  del /F /Q .\lib\asm*.jar
  del /F /Q .\lib\nashorn*.jar
)

rem
rem Determining argument count.
rem
SET ARGUMENT_COUNT=0
FOR %%X IN (%*) DO SET /A ARGUMENT_COUNT+=1

rem
rem Validating arguments and setting internal variables.
rem
IF %ARGUMENT_COUNT% LSS 4 (
  CALL :fail "Invalid argument count"
  EXIT /b 1
)
IF %ARGUMENT_COUNT% GTR 10 (
  CALL :fail "Invalid argument count"
  EXIT /b 1
)

SET JS_SETUP_MODE=%1
IF NOT "%JS_SETUP_MODE%"=="install" IF NOT "%JS_SETUP_MODE%"=="upgrade" (
  CALL :fail "Setup mode expected as input"
  EXIT /b 1
)

SET JS_EDITION=%2
IF NOT "%JS_EDITION%"=="ce" IF NOT "%JS_EDITION%"=="pro" (
  CALL :fail "JasperReports Server edition expected as input"
  EXIT /b 1
)

SET JS_OPTION=%3
SET JS_ANT_TARGET=%4

SETLOCAL ENABLEDELAYEDEXPANSION
IF "%JS_SETUP_MODE%"=="upgrade" (
  SET _JS_ANT_OPTIONS=-Dstrategy=%5
  IF "%5"=="standard" IF NOT ""%6""=="""" (
    SET _JS_ANT_OPTIONS=!_JS_ANT_OPTIONS! -DimportFile=%6
    FOR %%X IN (%*) DO (
      IF "%%X"=="include-access-events" ( SET _IMPORT_ARGS=--%%X !_IMPORT_ARGS!)
      IF "%%X"=="include-audit-events" ( SET _IMPORT_ARGS=--%%X !_IMPORT_ARGS!)
      IF "%%X"=="include-monitoring-events" ( SET _IMPORT_ARGS=--%%X !_IMPORT_ARGS!)
      IF "%%X"=="include-server-settings" ( SET _IMPORT_ARGS=--%%X !_IMPORT_ARGS!)
    )
    IF NOT "!_IMPORT_ARGS!"=="" (
      SET _JS_ANT_OPTIONS=!_JS_ANT_OPTIONS! -DimportArgs="!_IMPORT_ARGS!"
    )
  )
)
ENDLOCAL & SET JS_ANT_OPTIONS=%_JS_ANT_OPTIONS% -Djs.setup.mode=%JS_SETUP_MODE% -Djs.option=%JS_OPTION%

rem
rem Initializing time variable.
rem
CALL "%~dp0/date.bat"
CALL "%~dp0/time.bat"
SET JS_CURRENT_TIME=%NOW_YYYY_MM_DD%_%NOW_HH_MM%

rem
rem Defining log file name, creating log directory if it doesn't exist.
rem
SET /a JS_LOG_FILE_PREFIX=%RANDOM%+10000
SET JS_LOG_FILE=logs/js-%JS_SETUP_MODE%-%JS_EDITION%_%JS_CURRENT_TIME%_%JS_LOG_FILE_PREFIX%.log
IF NOT EXIST logs (
  md logs
)
ECHO Writing to log file: %JS_LOG_FILE%

rem
rem Printing entry information.
rem
CALL :log
CALL :log "Running JasperReports Server %JS_SETUP_MODE% script at %JS_CURRENT_TIME%"
CALL :log

rem
rem Checking JAVA_HOME.
rem
if "%JAVA_HOME%"=="" (
  CALL :log "WARNING: JAVA_HOME environment variable not found"
)

rem
rem Setting up Ant.
rem

CALL :log "[%JS_OPTION%]"

:initializeAntEnvironment
IF EXIST "..\apache-ant" ( GOTO :useBundledAnt )
CALL :log "Bundled Ant not found. Using system Ant."
SET ANT_RUN=ant
GOTO :endAntSetup

:useBundledAnt
SET ANT_HOME=..\apache-ant
SET ANT_RUN=%ANT_HOME%\bin\ant
SET PATH=%PATH%;%ANT_HOME%\bin

:endAntSetup

rem
rem Running Ant.
rem

:runAnt
IF "%JS_SETUP_MODE%"=="upgrade" (
  IF "%BUILDOMATIC_MODE%"=="" set BUILDOMATIC_MODE=interactive
)

IF "%JS_ANT_TARGET%" == "" ( GOTO :antTargetNotSpecified )
CALL :log "Running %JS_ANT_TARGET% Ant task"
CALL :log
CALL %ANT_RUN% -nouserlib -lib . -lib lib -f build.xml %JS_ANT_TARGET% %JS_ANT_OPTIONS% 2>&1 | "%~dp0/wtee" -a %JS_LOG_FILE%

IF ERRORLEVEL 1 ( GOTO :runAntFailed )
CALL :log "Checking Ant return code: OK"
CALL :log
GOTO :end

rem -----------------------------------------------------------------------------

rem
rem Console + file logging subroutine.
rem
:log
SET JS_LOG_MESSAGE=
IF "%~1" == "" SET JS_LOG_MESSAGE=----------------------------------------------------------------------
IF NOT "%~1" == "" SET JS_LOG_MESSAGE=%~1
ECHO %JS_LOG_MESSAGE% | "%~dp0/wtee" -a %JS_LOG_FILE%
GOTO:EOF

:showUsage
ECHO Usage: ./do-js-setup.bat {setup mode} {edition} {script option} {Ant target} {Ant options}
GOTO:EOF

:fail
IF NOT "%~1" == "" ( ECHO %~1 )
CALL :showUsage
EXIT /b 1

:runAntFailed
CALL :log "Checking Ant return code: BAD (1)"
EXIT /b 1

:end
EXIT /b 0
