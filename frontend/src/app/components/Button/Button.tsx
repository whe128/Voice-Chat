import { FC } from 'react';
import { css, styled, Interpolation } from 'styled-components';

interface Props {
  children: React.ReactNode;
  size?: Size;
  fullWidth?: boolean;
}

type Size = 'small' | 'medium' | 'large';

const styledSize: Interpolation<{
  $size: Size;
  $fullWidth: boolean;
}> = ({ $size }) => {
  switch ($size) {
    case 'small':
      return css`
        height: 30px;
        padding: 8px;
        gap: 4px;
        border-radius: 6px;
      `;
    case 'medium':
      return css`
        height: 40px;
        padding: 10px;
        gap: 6px;
        border-radius: 10px;
      `;
    case 'large':
      return css`
        height: 80px;
        padding: 20px;
        gap: 8px;
        border-radius: 20px;
      `;
  }
};

const StyledButton = styled.button<{
  $size: Size;
  $fullWidth: boolean;
}>`
  display: inline-block;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  cursor: pointer;

  user-select: none;

  &:disabled {
    cursor: not-allowed;
  }

  background-color: #f5ea14;
  border: 1px solid #f5ea14;
  &:hover {
    background-color: #ddd312;
    border: 1px solid #ddd312;
  }

  &:active {
    background-color: #c0b712;
    border: 1px solid #c0b712;
  }

  ${styledSize}

  width: ${(p): string => (p.$fullWidth ? '100%' : 'auto')};
`;

const Button: FC<Props> = ({
  children,
  size = 'medium',
  fullWidth = false,
}) => (
  <StyledButton $size={size} $fullWidth={fullWidth}>
    {children}
  </StyledButton>
);

export default Button;
