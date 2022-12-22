import _ from "underscore";

const grouper = (x, f) => {
  return x.reduce((a, b, i) => ((a[f(b, i, x)] ||= []).push(b), a), {});
};

_.groupByMulti = function (obj, values, context) {
  if (!values.length) return obj;
  var byFirst = _.groupBy(obj, values[0], context),
    rest = values.slice(1);
  for (var prop in byFirst) {
    byFirst[prop] = _.groupByMulti(byFirst[prop], rest, context);
  }
  return byFirst;
};

export default grouper;
