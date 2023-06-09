import styled from 'styled-components'

export const Container = styled.div`

  width: 100%;
  height: 100%;

  display: flex;
  gap: .8rem;

  h3{
    width: 100%;
    margin-bottom: 1.2rem;
    text-align: center;
  }

  form{
    width: 100%;
    display: grid;
    grid-template-rows: auto auto;


    div{
      width: 100%;
      display: flex;
      align-items: center;
      column-gap: .8rem;
      label{
        font-size: 1.4rem;
      }
    }

    .amountField{
      width: 12rem;
    }

    .productField{
      width: 100%;
    }

  }

  section:first-child{
    padding: 0 1.2rem;
    flex: 1;
  }

  @media(max-width: 1087px){
    section:last-child{display: none;}
  }
  @media(max-height: 650px){
    section:last-child{display: none;}
  }

  animation: mymove .5s;

  @keyframes mymove {
    from {
      transform: translateY(1rem);
    }
    to {
      transform: translateY(0);
    }
  }

  section:last-child{
    border: 0.1rem solid ${p => p.theme.colors.dark.gray10};
    border-radius: .4rem;
    height: calc(100vh - 7.4rem);

    div{
      aspect-ratio: 7/10;
      height: 100%;
      background-color: aquamarine;
    }
  }

  tr[data-fractional='yes']{
    background-color: ${p => p.theme.colors.light.red4};
    &:hover{
      background-color: ${p => p.theme.colors.light.red5};
    }
  }

  tbody tr{
    &:hover{
      background-color: ${p => p.theme.colors.light.gray4};
      cursor: pointer;
    }
  }

`

export const DownloadError = styled.span`
  font-size: 1.2rem;
  color: ${p => p.theme.colors.light.red11};
  padding: .4rem;
`

export const Separator = styled.div`
  width: 100%;
  height: 1px;
  margin-top: .4rem;
  margin-bottom: 1.2rem;
  background-color: ${p => p.theme.colors.light.gray5};
`

export const Info = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: start;
  font-size: 1.2rem;
  margin-top: 1.2rem;
  padding: 0 .8rem;

  span{
    color: ${p => p.theme.colors.light.gray10};
  }

`
