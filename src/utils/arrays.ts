interface SplitWhenOptions {
  includeLastValueInBothGroups?: boolean;
}

export function splitWhen<T>(
  array: T[],
  predicateFn: (t: T) => boolean,
  options: SplitWhenOptions = {}
) {
  if (array.length < 1) {
    return [];
  } else if (array.length === 1) {
    return [array];
  }

  if (options.includeLastValueInBothGroups === undefined) {
    options.includeLastValueInBothGroups = false;
  }

  const groups: T[][] = [];
  let currentGroup: T[] = [];
  let lastPredicate = predicateFn(array[0]);

  array.forEach(value => {
    const currentPredicate = predicateFn(value);

    if (lastPredicate === currentPredicate) {
      currentGroup.push(value);
    } else {
      if (options.includeLastValueInBothGroups) {
        currentGroup.push(value);
      }
      groups.push(currentGroup);
      currentGroup = [value];
    }

    lastPredicate = currentPredicate;
  });

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

interface ChunkOptions {
  includeLastValueInBothGroups?: boolean; // Will result in chunks being chunkSize + 1
}

export function chunk<T>(
  array: T[],
  chunkSize: number,
  options: ChunkOptions = {}
) {
  let acc: T[][] = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    const startIdx = i;
    const endIdx = options.includeLastValueInBothGroups
      ? i + chunkSize + 1
      : i + chunkSize;
    const chunk = array.slice(startIdx, endIdx);
    acc.push(chunk);
  }

  return acc;
}
