import styled from 'styled-components'
import { Paper, TextField } from "@mui/material";

export const Container = styled.main`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

`

export const AuthCard = styled(Paper)`
  width: 400px;
  padding: 28px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;

  background-color: ${p => p.theme.palette.mode == 'light' ?
    p.theme.palette.grey[300] : ''};

  button{
    margin-top: 24px;
    font-size: 12px;
    width: 80%;
  }
`

export const InputText = styled(TextField)`

  font-size: 16px !important;

  width: 80%;

  input{
    padding-top: 8px;
    padding-bottom: 8px

  }

`