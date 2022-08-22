import React from 'react';

import './styles.module.css';
import VirtualizedList from '../VirtualizedList';
import ListItem from '../ListItem';
import { values } from './const';
import classes from './styles.module.css';

const Index = () => (
  <div className={classes.container}>
    <div className={classes.wrapper}>
      <VirtualizedList
        items={values}
        viewportHeight={350}
        // rowHeight={100}
        rowHeight={(index) => (index % 2 ? 100 : 50)}
        renderItem={({ number, value }, index) => (
          <ListItem
            number={number}
            value={value}
            style={{
              height: index % 2 ? 100 : 50,
              backgroundColor: index % 2 ? 'red' : 'blue',
            }}
          />
        )}
      />
    </div>
  </div>
);

export default Index;
