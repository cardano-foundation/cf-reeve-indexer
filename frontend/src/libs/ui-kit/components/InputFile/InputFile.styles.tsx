import { styled } from 'styled-components'

export const InputFileStyled = styled('input')`
  && {
    width: 0;
    height: 0;
    position: absolute;
    bottom: 0;
    left: 0;
    overflow: hidden;
    whitespace: nowrap;
    clip: rect(0 0 0 0);
    clippath: inset(50%);
  }
`
