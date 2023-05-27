/*
The Linear Spline class is used to create a 
spline on the graph of displacement(d) with respect to time(t)

Can assign values to d (e.g. size) so as time (t) moves, a designated
d value will be shown 
*/
class LinearSpline {
  constructor(lerp) {
    this.points = [];
    this.interpolation = lerp;
  }

  AddPoint(t, d) {
    this.points.push([t, d]);
  }

  Get(t) {
    let p1 = 0;

    for (let i = 0; i < this.points.length; i++) {
      if (this.points[i][0] >= t) {
        break;
      }
      p1 = i;
    }

    const p2 = Math.min(this.points.length - 1, p1 + 1);

    if (p1 == p2) {
      return this.points[p1][1];
    }

    return this.interpolation(
      (t - this.points[p1][0]) / (
        this.points[p2][0] - this.points[p1][0]),
      this.points[p1][1], this.points[p2][1]);
  }
}

export { LinearSpline }