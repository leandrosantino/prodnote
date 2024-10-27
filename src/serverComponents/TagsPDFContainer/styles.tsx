import styled from 'styled-components'

export const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: start;
  flex-direction: column;
  align-items: center;
  &>*{
    font-family: Arial;
  }
`

export const Sheet = styled.div`
  &>*{
    font-family: Arial;
  }
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 2px;
`
