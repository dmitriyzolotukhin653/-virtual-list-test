import React, { CSSProperties } from 'react';

import classes from './styles.module.css';

type ListItemProps = {
  number: number;
  value: number;
  style: CSSProperties;
};

const ListItem: React.FC<ListItemProps> = ({ number, value, style }) => {
  return (
    <form className={classes['item-wrapper']} style={style}>
      <div>Number: {number}</div>
      <div>Value: {value}</div>
    </form>
  );
};

export default ListItem;
