export function getCatCardStyle(catStyle, options = {}) {
  const { noBorder = false, noGradient = false } = options;
  return {
    background:  noGradient ? "transparent" : `linear-gradient(to left, ${catStyle.bg}, transparent)`,
    borderRight: noBorder   ? "none"        : `3px solid ${catStyle.dot || catStyle.color}`,
  };
}