// format axis with 3 numbers and change bilions encoding
const AxisTickFormat = number =>
  	d3.format('.2s')(number).replace('G', 'B');