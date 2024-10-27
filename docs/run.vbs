Option Explicit

Dim processName, objWMIService, colProcessList, objProcess, scriptDir, WshShell, browserCommand

scriptDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
processName = "prodnote.exe"

Set objWMIService = GetObject("winmgmts:\\.\root\cimv2")
Set colProcessList = objWMIService.ExecQuery("Select * from Win32_Process Where Name = '" & processName & "'")

If colProcessList.Count > 0 Then
  MsgBox "Sistema online!", 0 ,"Sistema OEE"
Else
    If MsgBox("Realmente dejesa iniciar o sistema de apontamento de OEE?",4,"Sistema OEE") = 6 Then
        Set WshShell = CreateObject("WScript.Shell")
        WshShell.Run chr(34) & scriptDir &"/" & processName & Chr(34), 0
        WScript.Sleep 5000
        browserCommand = "cmd /c start http://localhost:3336"
        WshShell.Run browserCommand, 1, false
        Set WshShell = Nothing
        MsgBox "Sistema iniciado com sucesso!!!", 0 ,"Sistema OEE"
    End If
End If
