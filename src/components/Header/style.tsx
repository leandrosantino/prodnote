import { AppBar, Menu } from '@mui/material'
import styled from 'styled-components'

export const Appbar = styled(AppBar) <{ isAuth: boolean }>`
  /* background-color: ${p => p.theme.palette.grey[900]}; */
  flex-direction: row;
  div{
    width: 100%;
    min-height: fit-content;
    justify-content: ${p => p.isAuth ? 'space-between' : 'center'};
  }

`

export const UserMenu = styled(Menu)`
  margin-top: 12px;
  span{}
  li{
    p{font-size: 12px !important;}
    gap: 4px;
    justify-content: space-between;

    &:last-child{
      color: ${p => p.theme.palette.error.main};
    }
  }

`
