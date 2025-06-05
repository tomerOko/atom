import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

const AccordionWrapper = styled.div`
  width: 100%;
`;

const AccordionItem = styled.div`
  background-color: ${theme.colors.veryLightGray};
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing.md};
  overflow: hidden;
  transition: all ${theme.transitions.base};
`;

const AccordionHeader = styled.button<{ isOpen: boolean }>`
  width: 100%;
  padding: ${theme.spacing.lg};
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: right;
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.medium};
  color: ${theme.colors.dark};
  transition: all ${theme.transitions.fast};

  &:hover {
    background-color: ${theme.colors.lightGray}33;
  }

  &:focus {
    outline: none;
    background-color: ${theme.colors.lightGray}33;
  }
`;

const AccordionIcon = styled.span<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  position: relative;
  transition: transform ${theme.transitions.base};

  ${props =>
    props.isOpen &&
    css`
      transform: rotate(180deg);
    `}

  &::before {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    border-right: 2px solid ${theme.colors.dark};
    border-bottom: 2px solid ${theme.colors.dark};
    transform: rotate(45deg) translateY(-25%);
  }
`;

const AccordionContent = styled.div<{ isOpen: boolean }>`
  max-height: ${props => (props.isOpen ? '500px' : '0')};
  opacity: ${props => (props.isOpen ? '1' : '0')};
  overflow: hidden;
  transition: all ${theme.transitions.base};
  padding: ${props => (props.isOpen ? `0 ${theme.spacing.lg} ${theme.spacing.lg}` : '0')};
  color: ${theme.colors.gray};
  font-size: ${theme.fontSizes.base};
  line-height: 1.6;
`;

interface AccordionItemData {
  id: string;
  title: string;
  content: string | React.ReactNode;
}

interface AccordionProps {
  items: AccordionItemData[];
  allowMultiple?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ items, allowMultiple = false }) => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (itemId: string) => {
    if (allowMultiple) {
      setOpenItems(prev =>
        prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
      );
    } else {
      setOpenItems(prev => (prev.includes(itemId) ? [] : [itemId]));
    }
  };

  return (
    <AccordionWrapper>
      {items.map(item => {
        const isOpen = openItems.includes(item.id);

        return (
          <AccordionItem key={item.id}>
            <AccordionHeader
              isOpen={isOpen}
              onClick={() => toggleItem(item.id)}
              aria-expanded={isOpen}
            >
              {item.title}
              <AccordionIcon isOpen={isOpen} />
            </AccordionHeader>
            <AccordionContent isOpen={isOpen}>{item.content}</AccordionContent>
          </AccordionItem>
        );
      })}
    </AccordionWrapper>
  );
};
