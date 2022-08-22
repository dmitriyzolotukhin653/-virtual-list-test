import React, {
  ReactElement,
  UIEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type VirtualizedListProps<T extends Record<string, unknown>> = {
  items: Array<T>;
  renderItem: (props: T, index: number) => JSX.Element;
  viewportHeight: number;
  rowHeight: number | ((index: number, props: T) => number);
};

const VirtualizedList = <T extends Record<string, unknown>>({
  viewportHeight,
  rowHeight,
  items,
  renderItem,
}: VirtualizedListProps<T>): ReactElement | null => {
  const [minVisibleIndex, setMinVisibleIndex] = useState(0);
  const [maxVisibleIndex, setMaxVisibleIndex] = useState(0);
  const [currentScrollTop, setCurrentScrollTop] = useState(0);

  const listRef = useRef<HTMLDivElement>(null);

  const listHeight = useMemo(() => {
    if (!items.length) return 0;

    if (typeof rowHeight === 'function')
      return items.reduce(
        (accum, item, index) => accum + rowHeight(index, item),
        0
      );

    return rowHeight * items.length;
  }, [items, rowHeight]);

  const calcDataForArbitraryRow = (scrollTop: number) => {
    if (typeof rowHeight !== 'function')
      return {
        newMinIndex: minVisibleIndex,
        newMaxIndex: maxVisibleIndex,
      };

    // Calculation of the first visible item scroll pos and index
    let newMidIndex = -1;
    let midScrollTop = 0;
    while (midScrollTop < scrollTop) {
      newMidIndex += 1;
      midScrollTop += rowHeight(newMidIndex, items[newMidIndex]);
    }

    // Calculation of the previous set of viewport-size items
    let minScrollTop = midScrollTop;
    let newMinIndex = newMidIndex;
    while (minScrollTop > midScrollTop - viewportHeight) {
      newMinIndex -= 1;
      minScrollTop -= rowHeight(newMinIndex, items[newMinIndex]);
    }

    // Calculation of the sets of next 2 viewport-size items
    let maxScrollTop = midScrollTop;
    let newMaxIndex = newMidIndex;
    while (maxScrollTop < midScrollTop + 2 * viewportHeight) {
      newMaxIndex += 1;
      maxScrollTop += rowHeight(newMaxIndex, items[newMaxIndex]);
    }

    return {
      newMinIndex,
      newMaxIndex,
    };
  };

  const calcDataForFixedRow = (scrollTop: number) => {
    if (typeof rowHeight === 'function')
      return {
        newMinIndex: minVisibleIndex,
        newMaxIndex: maxVisibleIndex,
      };

    const middleIndex = Math.floor(scrollTop / rowHeight);
    const viewportIndexes = Math.round(viewportHeight / rowHeight);
    const newMinIndex = middleIndex - viewportIndexes;
    const newMaxIndex = middleIndex + 2 * viewportIndexes;

    return {
      newMinIndex,
      newMaxIndex,
    };
  };

  const recalcData = (scrollTop: number) => {
    return typeof rowHeight === 'function'
      ? calcDataForArbitraryRow(scrollTop)
      : calcDataForFixedRow(scrollTop);
  };

  const handleWrapperScroll: UIEventHandler<HTMLDivElement> = (event) => {
    if (!items.length) return;

    const eventTarget = event.target as HTMLDivElement;
    const scrollTop = eventTarget.scrollTop;

    const scrollDiff = scrollTop - currentScrollTop;
    if (Math.abs(scrollDiff) < 30) return;

    const { newMaxIndex, newMinIndex } = recalcData(scrollTop);

    setMinVisibleIndex(newMinIndex);
    setMaxVisibleIndex(newMaxIndex);
    setCurrentScrollTop(scrollTop);
  };

  useEffect(() => {
    let rowIndex = 0,
      maxRowHeight = 0;

    if (typeof rowHeight === 'function') {
      while (maxRowHeight < 2 * viewportHeight) {
        maxRowHeight += rowHeight(rowIndex, items[rowIndex]);
        rowIndex += 1;
      }
    } else {
      rowIndex = Math.floor((2 * viewportHeight) / rowHeight);
    }

    setMaxVisibleIndex(rowIndex - 1);
  }, [items, rowHeight, viewportHeight]);

  useEffect(() => {
    listRef.current?.scroll({ top: 0, left: 0 });
  }, [items]);

  return (
    <div
      style={{
        height: viewportHeight,
        overflow: 'scroll',
      }}
      onScroll={handleWrapperScroll}
      ref={listRef}
    >
      <div style={{ height: listHeight }}>
        {items.slice(0, maxVisibleIndex + 1).map((item, index) => (
          <div
            style={{
              height:
                typeof rowHeight === 'function'
                  ? rowHeight(index, item)
                  : rowHeight,
            }}
            key={`virtualized-item-${index}`}
          >
            {index >= minVisibleIndex && renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualizedList;
