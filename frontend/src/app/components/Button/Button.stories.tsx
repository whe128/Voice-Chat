import type { Meta, StoryObj } from '@storybook/nextjs';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Small = {
  args: {
    children: 'Button',
    size: 'small',
    fullWidth: false,
  },
} satisfies Story;

export const Medium = {
  args: {
    children: 'Button',
    size: 'medium',
  },
} satisfies Story;

export const Large = {
  args: {
    children: 'Button',
    size: 'large',
  },
} satisfies Story;
