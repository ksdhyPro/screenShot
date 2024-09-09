!include "MUI2.nsh"

!define MUI_PAGE_CUSTOMFUNCTION_SHOW customPageShow
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
Page custom customPageCreate customPageLeave
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_LANGUAGE "English"

Var /GLOBAL CUSTOM_INPUT

Function customPageCreate
    nsDialogs::Create 1018
    Pop $0

    ${If} $0 == error
        Abort
    ${EndIf}

    nsDialogs::CreateControl StaticClass "LEFT TOP" 0% 0u 100% 12u "Please enter your name:"
    nsDialogs::CreateControl Edit "LEFT TOP" 0% 15u 100% 12u ""
    Pop $CUSTOM_INPUT

    nsDialogs::Show
FunctionEnd

Function customPageLeave
    ${NSD_GetText} $CUSTOM_INPUT $0
    MessageBox MB_OK "You entered: $0"
FunctionEnd

Function customPageShow
    ; Code to show the custom page
FunctionEnd
