import { createContext, useContext } from 'react';
import { DARK } from './theme';
import { getStyles } from './styles';

export const ThemeCtx = createContext({ C: DARK, styles: getStyles(DARK) });
export const useT = () => useContext(ThemeCtx);
