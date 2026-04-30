const grouper = (x, f) => {
  return x.reduce((a, b, i) => ((a[f(b, i, x)] ||= []).push(b), a), {});
};

grouper.groupByMulti = function groupByMulti(obj, values) {
  if (!values.length) return obj;
  const [firstKey, ...rest] = values;
  const byFirst = grouper(obj, (item) => item[firstKey]);

  for (const prop in byFirst) {
    byFirst[prop] = groupByMulti(byFirst[prop], rest);
  }

  return byFirst;
};

export default grouper;
