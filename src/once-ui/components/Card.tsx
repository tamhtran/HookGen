"use client";

import React, { forwardRef } from "react";
import { Flex } from ".";
import styles from "./Card.module.scss";
import { ElementType } from "./ElementType";
import classNames from "classnames";

interface CardProps extends React.ComponentProps<typeof Flex> {
  children?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, href, onClick, style, className, ...rest }, ref) => {
    const isInteractive = !!(href || onClick);

    return (
      <Flex
        ref={ref}
        background="surface"
        onBackground="neutral-strong"
        transition="macro-medium"
        border="neutral-medium"
        cursor={isInteractive ? "interactive" : "default"}
        align="left"
        className={classNames(
          styles.card,
          isInteractive && "focus-ring",
          isInteractive && "radius-l",
          className
        )}
        style={style}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onClick={onClick}
        {...rest}
      >
        {children}
      </Flex>
    );
  }
);

Card.displayName = "Card";
export { Card };
