import styled from 'styled-components'

export const Button = styled.button`
  height: fit-content;
  padding: .8rem;
  border-radius: .4rem;
  background-color: ${p => p.theme.colors.dark.blue4};
  color: ${p => p.theme.colors.dark.gray12};
  font-weight: 400;
  font-size: 1.4rem;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: .4rem;

  svg{
    width: 2rem;
    height: 2rem;
  }

  &:hover{
    opacity: .9;
  }
`
