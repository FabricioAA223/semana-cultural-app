// theme.ts
import { DefaultTheme } from "styled-components";

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      background: string;
      text: string;
      itemBackground: string;
      itemText: string;
      itemScoreBackground: string;
    };
    isDarkMode: boolean;
  }
}

export const darkTheme: DefaultTheme = {
  colors: {
    background: "#222",
    text: "#fff",
    itemBackground: "#333",
    itemText: "#fff",
    itemScoreBackground: "#555",
  },
  isDarkMode: true,
};