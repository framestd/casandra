import { css } from '@emotion/react';

export const styles = {
  main: css`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    height: 100%;
  `,
  grid: css`
    grid-template-columns: 1fr;
    margin-bottom: 120px;
    max-width: 320px;
    text-align: center;
  `,
  center: css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    padding: 4rem 0;
    height: 100%;

    &::before {
      background: var(--secondary-glow);
      border-radius: 50%;
      width: 480px;
      height: 360px;
      margin-left: -400px;
    }

    &::after {
      background: var(--primary-glow);
      width: 240px;
      height: 180px;
      z-index: -1;
    }

    &::before,
    &::after {
      content: '';
      left: 50%;
      position: absolute;
      filter: blur(45px);
      transform: translateZ(0);
    }

    @media (max-width: 700px) {
      & {
        padding: 8rem 0 6rem;
      }

      &::before {
        transform: none;
        height: 300px;
      }
    }
  `,
};
