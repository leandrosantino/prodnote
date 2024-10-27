Option Explicit
Dim processName, scriptDir, WshShell

scriptDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
processName = "bin.exe"
Set WshShell = CreateObject("WScript.Shell")

WshShell.Run chr(34) & scriptDir &"/" & processName & Chr(34), 0
Set WshShell = Nothing

