const grouper = (x, f) => {
  return x.reduce((a, b, i) => ((a[f(b, i, x)] ||= []).push(b), a), {});
};

export default grouper;
