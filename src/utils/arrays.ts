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
